import Link from "next/link";
import Image from "next/image";
import AxiosHelper from "../utils/helper/axios.helper";
import ChannelTimeSlotToggle from "./ChannelTimeSlotToggle";
import { useEffect, useState, Fragment, useMemo, useRef } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Constants from "../utils/helper/constants";
import moment from "moment";
import { CommonFunctions } from "../utils/common-functions";
import { removeZeroMinutes } from "../utils/helper/timeFormatter";

const {
  channelHandler,
  timeCellScreenWidthHandler,
  calculateWidth,
  showFirstAd,
  showFourthAd,
  showFifthAd,
  showSeventhAd,
  showEighthAd,
  showNinthAd,
} = require("../public/js/channelGrid");



export default function ChannelTimeSlot(props) {
  const { platformId, genre, selectedStartDateTime, selectedEndDateTime, times, onActiveDatedChanged, scrollWidthMapper, setScrollWidthMapper, setCurrentDate, setDateTime, currentDate, setTimes } = props;
  const [nextEPGNumber, setNextEPGNumber] = useState(0);
  const [totalChannels, setTotalChannels] = useState(0);
  const [hasMoreChannels, setHasMoreChannels] = useState(false);
  const [channels, setChannels] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const showsRef = useRef<HTMLElement>(null)
  const timeRef = useRef<HTMLElement>(null)
  const isFetching = useRef<boolean>(false)
  const scrollWidthMapperRef = useRef<Object>({})
  const currentDateRef = useRef<number>(0)
  const [toggleId, setToggleId] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const [showAd, setShowAd] = useState(0);
  const [adSpace, setAdSpace] = useState(false);
  const [channelIndex, setChannelIndex] = useState(null)
  const [collapseId, setCollapseId] = useState<string | null>(null);
  const [assetItem, setAssetItem]= useState(null);
  const [hideAd, setHideAd] = useState(false);
  const [currentActivePage, setCurrentActivePage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [channelLoading, setChannelLoading] = useState(false);

  //THIS HECK NEEDS TO BE REMOVED AS SOON AS BACKEND ISSUE RESOLVES
  const initiateTimeObserver = () =>{
    const children = document.querySelectorAll(".schedule-time-slots");
    let dateSelected = "";
    const observer = new IntersectionObserver( (entries, observer) => {
      entries.forEach (entry => {
        if (entry.intersectionRatio > 0) {
          dateSelected = entry.target.getAttribute("data-datetime");
        }
      });
      const currentDate = parseInt(moment(dateSelected).tz(Constants.TIME_ZONE).format("DD"))
      setCurrentDate(currentDate);
    });
    children.forEach( child => {
      observer.observe(child);
    });
  }

  useEffect(()=>{
    const user = CommonFunctions.GetLoggedInUser();
    if (user && !loggedInUser) {
      setLoggedInUser(true);
    }
  }, [])

  useEffect(()=>{
    if(!loading && hasMoreChannels) initiateInfiniteScroll();
  }, [loading])


  useEffect(()=>{
    initiateTimeObserver();
  }, [times])

  const timslotsWidth = useMemo(()=>{
    const hasWindow = typeof window !== 'undefined';
    if(hasWindow){
      let timeCurosel = document.getElementById("time-cell");
      return timeCurosel && timeCurosel.scrollWidth - 1;
    }
  }, [schedule])



  useEffect(()=>{
    resetCalendar();
    const user = CommonFunctions.GetLoggedInUser();
    if(user && platformId == "c101") fetchMoreUsersData();
    else{
      setLoading(true);
      setChannelLoading(true);
      fetchChannels(0, result=>{
        setChannelLoading(false);
        const c = result.data.length ? result.data[result.data.length - 1].platforms.filter(cp => cp.platformId === platformId)[0]: {};
        const hasMore = result.data.length < result?.meta?.totalRecords;

        setChannels(result?.data || []);
        setTotalChannels(result?.meta?.totalRecords || 0)
        setNextEPGNumber(c?.epgNumber || 0);
        setHasMoreChannels(hasMore);
        if(result?.data?.length){
          const allChannelIDs = result.data.map((ch) => ch.Id).join(",");
          fetchSchedule(allChannelIDs, result=>{
            mapSchedules(result?.data, data=>{
              checkAndSetEndDate(data);
              setSchedule(data || [])
              setLoading(false);
            })
          });
        }
        else setLoading(false);
      })
    }
  }, [genre, selectedStartDateTime])

  useEffect(()=>{
    showsRef.current = document.getElementById('showsHorizontal')
    timeRef.current = document.getElementById('time-cell');
    showsRef.current?.addEventListener('scroll', (e) => onListHorizontalScroll(e, 'showsHorizontal'))
    return () => {
      showsRef.current?.removeEventListener('scroll', (e) => onListHorizontalScroll(e, 'showsHorizontal'))
    }
  }, [genre, selectedStartDateTime, selectedEndDateTime])

  /**
   * This function will reset all states of calendar, use this when we want to refresh calendar
   */
  const resetCalendar = () =>{
    setChannels([]);
    setTotalChannels(0)
    setNextEPGNumber(0);
    setHasMoreChannels(false);
    setSchedule([])
    setToggleId("")
    setShowToggle(false);
    setChannelIndex(null);
  }

  const checkAndSetEndDate = (data) =>{
    if(data?.length){
      let allSchedules = [];
      data.forEach(schedules=>{
        allSchedules = allSchedules.concat(schedules.assetSchedules);
      })

      const allDates = allSchedules.map(element => {
        return new Date(element.endDate);
      })
      const maxDate = (dates: Date[]) => new Date(Math.max(...dates.map(Number)));
      const maxDateVal = moment(maxDate(allDates)).tz(Constants.TIME_ZONE).format(Constants.UTC_FORMAT_TIME);
      setDateTime({
        startRange: selectedStartDateTime,
        endRange: maxDateVal
      })
    }
  }



  /**
   * Single function to be used to fetch all channels
   * @param epgNumber 
   * @param cb 
   */
  const fetchChannels = (epgNumber, cb) =>{
    if(platformId){
      const request = new AxiosHelper( `/channel/all/${platformId}/${epgNumber}`);
      request.get().then((result) => {
        cb(result);
      })
    }
  }

  /**
   * Functon to be used to fetch schedule information
   * @param allChannelIDs 
   * @param cb 
   */
  const fetchSchedule = (allChannelIDs, cb, startDate = selectedStartDateTime, endDate = selectedEndDateTime) =>{
    let apiURL = `/schedule/list?platformId=${platformId}&selectedStartDateTime=${startDate}&selectedEndDateTime=${endDate}&channelIds=${allChannelIDs}`;
    if(genre) apiURL += `&category=${genre}`;

    const request = new AxiosHelper(apiURL);
    request.get().then((result) => {
      cb(result);
    })
  }

  /**
   * This function will be trigerred as soon as users will scroll to right or left on schedular
   * @param e 
   * @param id 
   * @returns 
   */
  const onListHorizontalScroll = (e: any, id: string) => {
    const scrollthreshold = timeRef.current?.scrollWidth - 3000;

    if (id === 'showsHorizontal') {
      if (showsRef.current.scrollLeft > scrollthreshold && !isFetching.current) {
        isFetching.current = true
        document.getElementById("loadMoreSlots").click();
       return
      }
      timeRef.current.scroll(showsRef.current.scrollLeft, 0)
      ////////// below logic is to update date ---------------------------
      const currentKey = Object.keys(scrollWidthMapperRef.current).find(key => scrollWidthMapperRef.current[key] - 600 > timeRef.current.scrollLeft)

      if (currentKey && currentDateRef.current !== parseInt(currentKey)) {
        //setCurrentDate(parseInt(currentKey));
      }
      ////////////////////////////////////////////////--------------------
      // fetch previous records enabler
      const fetchPreviousRecords = currentDateRef.current !== parseInt(currentKey) && timeRef.current.scrollLeft <= scrollWidthMapperRef.current[currentDateRef.current - 1] && timeRef.current.scrollLeft && !isFetching.current;
      if (fetchPreviousRecords) {
        isFetching.current = true
        onActiveDatedChanged(true)
      }
     }
  }

    /**
   * @param response It is asset schedules based on channels
   * @param channels It contains channel's basic data i.e title/logo etc
   * @param lastChannel It contains last channel record for epgNumber
   */
    const mapSchedules = (response, cb, offsetWidth = 0) => {
    if (response) {
      let finalResponse = response.sort((a, b) => {
        if (a.channel.epg - b.channel.epg === 0) return 1
        else return a.channel.epg - b.channel.epg
      });
      const r = channelHandler(finalResponse);
      timeCellScreenWidthHandler();
      const data = calculateWidth(r, offsetWidth);
      cb(data);
    } 
    else {
      cb([]);
      // Nothing found in the DB.
      // mapNoDataFoundAgainstFilter();
    }
  };


  const initiateInfiniteScroll = () =>{
    CommonFunctions.Observe('.channels-lazy-loader', 400, fetchMoreData)
  }

  /**
   * This function will decide whether user's information is to be fetched to guest user's
   */
  const fetchMoreData = () =>{
    if(!loading){
      if(loggedInUser && platformId === "c101") fetchMoreUsersData();
      else fetchMoreGuestData();
    }
  }


  /**
   * Infinite scroll function for guest users
   */
  const fetchMoreGuestData = () =>{
    setLoading(true);
    setChannelLoading(true);
    fetchChannels(nextEPGNumber, result=>{
      setChannelLoading(false);
      if(result?.data?.length ){
        const c = result.data[result.data.length - 1].platforms.filter((cp) => cp.platformId === props.platformId)[0];
        const allChannelIDs = result.data.map((ch) => ch.Id).join(",");
        const hasMore = channels.length + result.data.length < result?.meta?.totalRecords;
        setTotalChannels(result?.meta?.totalRecords || 0);
        setNextEPGNumber(c?.epgNumber || 0);
        setHasMoreChannels(hasMore);
        setChannels([...channels, ...result.data]);
        fetchSchedule(allChannelIDs, result=>{
          mapSchedules(result?.data, data=>{
            if(data) setSchedule([...schedule, ...data] || []);
            setLoading(false);
            
          })
        });
      }
      else {
        setLoading(false);
      }
    });
  }

  /**
   * Infinite scroll function for logged in users
   */
  const fetchMoreUsersData = () =>{
    setLoading(true);
    fetchCustomisedChannels(customChannels=>{
      localStorage.setItem("totalCount", JSON.stringify(customChannels?.data?.length));
      let totalPages = Math.ceil(customChannels?.data?.length / Constants.CUSTOMIZED_CHANNEL_PAGE_SIZE);
      localStorage.setItem("totalPages", JSON.stringify(totalPages));
      let currentPage = localStorage.getItem("currentPage");
      if (!currentPage) localStorage.setItem("currentPage", JSON.stringify(1));
      currentPage = localStorage.getItem("currentPage");
      const parsedCurrentPage = currentActivePage;
      if (totalPages >= parsedCurrentPage) {
        setCurrentActivePage((prevState) => prevState + 1);
        const newChannels = CommonFunctions.Paginate(
          customChannels.data,
          Constants.CUSTOMIZED_CHANNEL_PAGE_SIZE,
          parsedCurrentPage
        );

        if (customChannels?.data?.length) {
          const hasMore = [...channels, ...newChannels].length < customChannels?.data?.length;
          const allChannelIDs = newChannels.map((ch) => ch.Id).join(",");

          setHasMoreChannels(hasMore);
          setChannels([...channels, ...newChannels]);
          setTotalChannels(customChannels?.data?.length);
          fetchSchedule(allChannelIDs, result=>{
            mapSchedules(result?.data, data=>{
              setSchedule([...schedule, ...data] || [])
              setLoading(false);
            })
          });
        } 
        else {
          setLoading(false);
          // Nothing found in the DB.
         // mapNoDataFoundAgainstFilter(true);
        }
      }
    })
  }

  const loadMoreDate = () =>{
    const timeRef = document.getElementById('time-cell');
    const oldWidth = timeRef.scrollWidth;

    setLoading(true);
    const startDate = selectedEndDateTime;
    const endDate = moment(selectedEndDateTime).tz(Constants.TIME_ZONE).add(1, 'd').tz(Constants.TIME_ZONE).format(Constants.UTC_FORMAT_TIME);
    setDateTime({
      startRange: selectedStartDateTime,
      endRange: endDate
    });

    const allChannelIDs = channels.map((ch) => ch.Id).join(",");

    fetchSchedule(allChannelIDs, result=>{
      addNewTimeSlots(endDate, (newSlots)=>{
        mapSchedules(result?.data, data=>{
          checkAndSetEndDate(data);
          setTimes(newSlots);
          let newSchedule = schedule.map(oldValue=>{
            let newTimeslotsArr = data.filter(tuple=> tuple.id == oldValue.id);
            let assetValues = newTimeslotsArr?.[0]?.assetSchedules ? oldValue.assetSchedules.concat(newTimeslotsArr[0].assetSchedules) : oldValue.assetSchedules;
            assetValues = assetValues.filter(
              (v, i, a) => a.findIndex(t => t.assetId === v.assetId && t.startDate === v.startDate) === i
            );
            return {
              ...oldValue,
              assetSchedules: assetValues
            }
          });
          setSchedule(newSchedule);
          setLoading(false);
          isFetching.current = false;
        }, oldWidth)
      })
    }, startDate, endDate);
  }

  const addNewTimeSlots = (endDate, cb) =>{
    let currentTimes = [];
    let time = moment(selectedStartDateTime).tz(Constants.TIME_ZONE);
    while (time <= moment(endDate).tz(Constants.TIME_ZONE)) {
      currentTimes.push(time);
      time = moment(time).add(Constants.SLOT_INTERVAL, "minutes")
    }
    cb(currentTimes);
  }

  /**
   * This function is first checking if user's customised channels list is in localstorage, if not then will be fetched using API and then will be stored in localstorage
   * @param cb 
   */
  const fetchCustomisedChannels = (cb) =>{
    const user = CommonFunctions.GetLoggedInUser();
    let customizedChannels = localStorage.getItem( Constants.USER_CUSTOMIZED_CHANNEL_KEY);
    if (customizedChannels) {
      customizedChannels = JSON.parse(localStorage.getItem(Constants.USER_CUSTOMIZED_CHANNEL_KEY));
      cb(customizedChannels);
    } 
    else {
      const request = new AxiosHelper(`/userchannel/${user?.id}`);
      request.get().then((response) => {
        localStorage.setItem(Constants.USER_CUSTOMIZED_CHANNEL_KEY,JSON.stringify(response));
        cb(response);
      })
      .catch((e) => {
        cb([]);
      });
    }
  }
  

  const showCurrentToggledItem = (selectedSchedule, index) =>{
    if (toggleId === "") {
      setShowToggle(true);
      setToggleId(selectedSchedule.assetId);
    } 
    else if (toggleId === selectedSchedule.assetId && showToggle) {
      setShowToggle(false);
      setToggleId("");
    } 
    else if (showToggle) {
      setToggleId(selectedSchedule.assetId);
    }
    setCollapseId((prevState) => (prevState ? null : selectedSchedule.assetId));
    setAssetItem(selectedSchedule)
    setChannelIndex(index);
  }


  /**
   * IMPORTANT: WE NEED TO GET RID OF SET TIMEOUT HERE
   */
  const getAdClass = (index) => {
    if (!adSpace) {
      setAdSpace(true);
    }
    if (index === 3) {
      setTimeout(showFirstAd, 2000);
      return "first-ad";
    }
    if (index === 11) {
      setTimeout(showFourthAd, 2000);
      return "fourth-ad";
    }
    if (index === 19) {
      setTimeout(showFifthAd, 2000);
      return "fifth-ad";
    }
    if (index === 27) {
      setTimeout(showSeventhAd, 2000);
      return "seventh-ad";
    }
    if (index === 35) {
      setTimeout(showEighthAd, 2000);
      return "eighth-ad";
    }
    if (index === 43) {
      setTimeout(showNinthAd, 2000);
      return "ninth-ad";
    }
  };

  return (
    <div className="row mx-0">
      <div className="col-md-12 p-0">
        <div className="program-table-outer wrapper list">
          <div className="marker-overlay" id="marker-overlay"></div>
          <div className="time-bar bg-info hide" id="marker"></div>
          <div className="d-inline-flex flex-wrap w-100 channel-inner-wrapper">
            <div className="d-flex align-items-baseline channel-img light-gray-border">
              <div className="infinite-scroll-component__outerdiv">
                <div className="infinite-scroll-component" style={{height: "auto", overflow: "auto"}}>
                  {channels?.map((item, index) => (
                    <Fragment key={index}>
                      <Link href={`/channel/${item?.title.replaceAll(" ", "-")}`} shallow scroll={false}>
                        <a>
                          <Image className="AnimateImage" key={index} src={CommonFunctions.FormatImageSrc(item?.logo)} width={110} height={80} alt={item?.title} />
                        </a>
                      </Link>
                      <div className={ showToggle && channelIndex === index ? `null schedule-testing ${showAd !== 1 ? 'no-ad-toggle' : ''}` : "null" }
                      ></div>
                      {(adSpace && ((index === 3 || ((index - 3) % 8 === 0)) && index <= 44)) && <div className="reserved-for-ads">This div is reserved for styling</div>}
                    </Fragment>
                  ))}
                  {!loading ? <div className="channels-lazy-loader"></div> : channelLoading && <Preact/>}
                </div>
              </div>
            </div>

            <div id="showsHorizontal" className={`channel-slots-container assetSchedules autoOverflow `}>
              {schedule.map((channel, i) => {
                return (
                  <Fragment key={i}>
                    <div className="channel-row position-relative w-100">
                      {channel.assetSchedules.length ? channel.assetSchedules?.map((schedule, ii) => {
                        return (
                          <div key={i + ii} className={`${schedule.width == "0px" && "border-0"} ${collapseId === schedule.assetId ? "active-cell " : ""} ${schedule.noProgramMode} position-absolute top-0 text-truncate cell program${schedule.actualMinute <= 15 ? " fifteenMinuteSlot" : ""}`}
                            aria-expanded="false"
                            style={{transform: `translateX(${parseInt(schedule.translateX )}px )`, width: `${schedule.width}`}}
                            onClick={() => { showCurrentToggledItem(schedule, i); setShowAd((prevState) => prevState + 1); }}
                            aria-controls={`${schedule.toggleId}`}
                            data-bs-toggle="collapse"
                            data-bs-target={`#${schedule.toggleId}`}
                          >
                            <a className={`pb-md-1 pb-0`}>
                              <div className="show-details">
                                <h3 className="show-name">
                                  {schedule.noProgramMode === "disable-slot"
                                    ? Constants.NO_SECHEDULER_DATA_TITLE
                                    : schedule.actualMinute > 15
                                      ? schedule.name
                                      : schedule.name?.trim()?.charAt(0) +
                                      "..."}
                                </h3>
                                <p className="show-time ">
                                  {(schedule.formattedStartDate && schedule.actualMinute > 15) ? `${removeZeroMinutes(schedule.formattedStartDate).hours}${removeZeroMinutes(schedule.formattedStartDate).minutes}${removeZeroMinutes(schedule.formattedStartDate)?.timeZone?.toLowerCase()}` : ''}
                                </p>
                              </div>
                            </a>
                          </div>
                        );
                      })
                    : <>
                      <div className={`disable-slot position-absolute top-0 text-truncate cell program}`} aria-expanded="false" style={{width: timslotsWidth}}>
                        <a className="pb-md-1 pb-0">
                          <div className="show-details">
                            <h3 className="show-name">{Constants.NO_SECHEDULER_DATA_TITLE}</h3>
                          </div>
                        </a>
                      </div>
                    </>}
                    </div>
                    <div>
                      {channelIndex == i ? (
                        <div className="ZIndexPriority tv-guide-slot-container">
                          <ChannelTimeSlotToggle
                            asset={assetItem}
                            parentId={i}
                            hideAd={hideAd}
                            setHideAd={setHideAd}
                            channelTitle={channel.title}
                            showAd={showAd}
                          />
                        </div>
                      ) : null}
                      <div
                        className={
                          showToggle && channelIndex === i
                            ? `null schedule-testing ${showAd !== 1 ? 'no-ad-toggle' : ''}`
                            : "null"
                        }
                      ></div>
                    </div>
                    {((i === 3 || ((i - 3) % 8 === 0)) && i <= 44) ? <div className={getAdClass(i)} /> : null}
                  </Fragment>
                );
              })}
            </div>
            <div className="d-flex align-items-center channel-img third-empty-col-slot"></div>
          </div>
          <div id="loadMoreSlots" style={{visibility: "hidden"}} onClick={()=>loadMoreDate()}>Load More Slots</div>
        </div>
      </div>
    </div>
  );
}

const Preact = () =>{
return <>
    <div className="d-flex justify-content-between w-100 skeltonBodyDiv mt-0">
      <span style={{ width: "100%" }}>
        <Skeleton
          className="skeltonBody mb-0"
          count={5}
          height={90}
        />
      </span>
    </div>
  </>
}