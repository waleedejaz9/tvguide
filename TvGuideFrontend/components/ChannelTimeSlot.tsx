import Link from "next/link";
import Image from "next/image";
import AxiosHelper from "../utils/helper/axios.helper";
import ChannelTimeSlotToggle from "./ChannelTimeSlotToggle";
import { useEffect, useReducer, useState, Fragment, useMemo, useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Constants from "../utils/helper/constants";
import moment from "moment";
import { CommonFunctions } from "../utils/common-functions";
import { removeZeroMinutes } from "../utils/helper/timeFormatter";
import debounce from "lodash.debounce";


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

const channelListDefaultState = {
  channelsCount: 0,
  totalRecords: 0,
  channelsData: [],
  hasMore: true,
  nextEPGNumber: 0,
  assetItem: {},
  indexValue: null,
};

const assetScheduleListDefaultState = {
  data: [],
  hasMore: true,
  channelsCount: 0,
  totalRecords: 0,
};

export default function ChannelTimeSlot1(props) {

  const [adLength,setAdLength] = useState(false);
  const [showAd, setShowAd] = useState(0);
  const [adSpace, setAdSpace] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const [toggleId, setToggleId] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(false);
  const [currentActivePage, setCurrentActivePage] = useState(1);
  const sameActions = "UpdateAssetToggle";
  const [collapseId, setCollapseId] = useState<string | null>(null);
  const [hideAd, setHideAd] = useState(false);
  const isFetching = useRef<boolean>(false)
  const { scrollWidthMapper, setCurrentDate, selectedStartDateTime, currentDate } = props
  const showsRef = useRef<HTMLElement>(null)
  const timeRef = useRef<HTMLElement>(null)

  const scrollWidthMapperRef = useRef<Object>({})
  const currentDateRef = useRef<number>(0)
  const assestsRef = useRef([])
  const timeIntervalRef = useRef(null)

  // Channel List Reducer Function
  const channelListReducer = (state, action) => {
    if (sameActions.includes(action.type)) {
      return { ...state, ...action.payload };
    } else if (action.type === Constants.UPDATE_EPG_NUMBER) {
      return {
        ...state,
        nextEPGNumber: action.payload,
      };
    } else if (action.type === Constants.UPDATE_CHANNEL_LIST) {
      return {
        ...state,
        channelsData: state.channelsData.concat(action.payload),
      };
    } else if (action.type === Constants.UPDATE_CHANNEL_COUNT) {
      return {
        ...state,
        channelsCount: state.channelsCount + action.payload,
      };
    } else if (action.type === Constants.UPDATE_TOTAL_RECORDS) {
      return {
        ...state,
        totalRecords: action.payload,
      };
    } else if (action.type === Constants.UPDATE_HAS_MORE) {
      if (action.payload !== null && action.payload !== undefined) {
        return { ...state, hasMore: action.payload };
      } else if (state.totalRecords === state.channelsCount) {
        return { ...state, hasMore: false };
      } else {
        return { ...state, hasMore: true };
      }
    }
    return state;
  };

  // Asset Schedule List Reducer Function
  const assetScheduleListReducer = (state, action) => {

    if (action.type === Constants.UPDATE_ASSET_SCHEDULE_DATA) {

      let data = action.payload
      if (state.data.length) {

        // // new channels 
        const newChannels = data.filter((incommingChannel) => {
          if (state.data.every((stateChannel) => stateChannel.id !== incommingChannel.id)) {
            return { incommingChannel }
          }
        })

        if (newChannels.length) {
          return {
            ...state,
            data: [...state.data, ...newChannels]
          };
        }

        // previous channels
        data = state.data.map((stateChannel: any, chanelIndex: number) => {
          const filteredChanel = data.find((incomingChannel) => stateChannel.id === incomingChannel.id)
          const schedules = filteredChanel ? stateChannel.assetSchedules.concat(filteredChanel.assetSchedules) : stateChannel.assetSchedules

          schedules.sort((a, b) => a.translateX - b.translateX)

          const unique = schedules.filter((schedule, pos) => {
            const indexValue = schedules.findIndex((uniqueSchedule) => schedule.scheduleId === uniqueSchedule.scheduleId)
            return pos === indexValue
          });

          return {
            ...stateChannel,
            assetSchedules: unique
          }
        })
      }
      return {
        ...state,
        data
      };

    }
    else if (action.type === Constants.UPDATE_RESIZE_SCHEDULE_DATA) {
      return {
        ...state,
        data: action.payload
      };
    }
    else if (action.type === Constants.UPDATE_RESIZE_SCHEDULE_DATA) {
      return {
        ...state,
        data: action.payload
      };
    }
    else if (action.type === Constants.RESET_STATE) {
      return {
        ...state,
        ...assetScheduleListDefaultState,
      };
    }

    return state;
  };

  const [channelListState, channelListDispatch] = useReducer(
    channelListReducer,
    channelListDefaultState
  );

  const [assetSchedulesState, assetSchedulesDispatch] = useReducer(
    assetScheduleListReducer,
    assetScheduleListDefaultState
  );


  const [schedulesOnDateTimeFilter, setSchedulesForDateTimeFilter] =
    useState<boolean>(false);

  const showCurrentToggledItem = (asset, index) => {
    if (toggleId === "") {
      setShowToggle(true);
      setToggleId(asset.assetId);
    } else if (toggleId === asset.assetId && showToggle) {
      setShowToggle(false);
      setToggleId("");
    } else if (showToggle) {
      setToggleId(asset.assetId);
    }
    setCollapseId((prevState) => (prevState ? null : asset.assetId));
    channelListDispatch({
      type: "UpdateAssetToggle",
      payload: { assetItem: asset, indexValue: index },
    });
  };
  useEffect(() => {
    channelListDispatch({
      type: "UpdateAssetToggle",
      payload: { assetItem: [], indexValue: null },
    });
  }, [props]);
  //This is being used for fetching channels.
  useEffect(() => {
    if (
      !props.platformId ||
      !props.genre ||
      !props.selectedStartDateTime ||
      !props.selectedEndDateTime
    )
      return;
    const user = CommonFunctions.GetLoggedInUser();
    if (user && !loggedInUser) {
      setLoggedInUser(true);
    }
    CommonFunctions.ResetChachedDefaultChannels();
    if (user && props.platformId === "c101") {
      CommonFunctions.ResetCachedCustomizedChannels();
      // Fetch Customized Channels
      fetchChannelsDataForUser();
    } else {
      fetchMoreChannelsData();
    }
    // eslint-disable-next-line
  }, [props.platformId]);

  //This is being used for fetching schedules only when we have channels and date/time gets changed.
  useEffect(() => {
    if (
      !schedulesOnDateTimeFilter ||
      !props.selectedStartDateTime ||
      !props.selectedEndDateTime
    )
      return;

    if (!props.times.length) {
      assetSchedulesDispatch({
        type: Constants.RESET_STATE,
        payload: assetScheduleListDefaultState,
      });
      CommonFunctions.ResetDefaultChannelPageCounter();

    }

    fetchMoreSchedulesData();
    // eslint-disable-next-line
  }, [props.times, props.selectedStartDateTime, props.selectedEndDateTime, props.genre]);


  const fetchMoreChannelsData = () => {



    const request = new AxiosHelper(
      `/channel/all/${props.platformId}/${channelListState.nextEPGNumber}`
    );
    request
      .get()
      .then((channels) => {
        channelListDispatch({
          type: Constants.UPDATE_TOTAL_RECORDS,
          payload: channels?.meta?.totalRecords,
        });

        channelListDispatch({
          type: Constants.UPDATE_CHANNEL_COUNT,
          payload: channels?.data?.length,
        });

        channelListDispatch({
          type: Constants.UPDATE_HAS_MORE,
        });

        if (channels.data?.length) {
          const c = channels.data[channels.data.length - 1].platforms.filter(
            (cp) => cp.platformId === props.platformId
          )[0];
          channelListDispatch({
            type: Constants.UPDATE_EPG_NUMBER,
            payload: c.epgNumber,
          });
          channelListDispatch({
            type: Constants.UPDATE_CHANNEL_LIST,
            payload: channels?.data,
          });

          // Caching channels so that when we fetch schedules on date/time change then we will grab their data
          // accordingly.
          let cachedChannels = localStorage.getItem(Constants.CHANNEL_KEY);
          if (cachedChannels) {
            const updatedCachedChannels = JSON.parse(cachedChannels).concat(
              channels?.data
            );
            localStorage.setItem(
              Constants.CHANNEL_KEY,
              JSON.stringify(updatedCachedChannels)
            );
          } else {
            localStorage.setItem(
              Constants.CHANNEL_KEY,
              JSON.stringify(channels?.data)
            );
          }

          renderSchedules(channels?.data, c);
        }
        setSchedulesForDateTimeFilter(true);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const fetchMoreSchedulesData = async () => {
    const user = CommonFunctions.GetLoggedInUser();
    let data = "";
    if (user && props.platformId === "c101") {
      data = localStorage.getItem(Constants.USER_CUSTOMIZED_CHANNEL_KEY);
    } else {
      data = localStorage.getItem(Constants.CHANNEL_KEY);
    }
    if (data) {
      let channels = JSON.parse(data);

      let totalPages = Math.ceil(channels.length / Constants.CHANNEL_PAGE_SIZE);
      localStorage.setItem(
        Constants.CHANNEL_KEY_TOTAL_PAGES,
        JSON.stringify(totalPages)
      );

      let currentPage = localStorage.getItem(
        Constants.CHANNEL_KEY_CURRENT_PAGE
      );

      localStorage.setItem(
        Constants.CHANNEL_KEY_CURRENT_PAGE,
        JSON.stringify(1)
      );

      currentPage = localStorage.getItem(Constants.CHANNEL_KEY_CURRENT_PAGE);

      // if (totalPages >= parseInt(JSON.parse(currentPage))) {
      let pagedChannels = CommonFunctions.Paginate(
        channels,
        Constants.CHANNEL_PAGE_SIZE,
        parseInt(JSON.parse(currentPage))
      );

      if (pagedChannels.length) {
        while (parseInt(currentPage) <= totalPages) {

          await renderSchedules(pagedChannels, pagedChannels.slice(-1));
          let currPg = parseInt(
            localStorage.getItem(Constants.CHANNEL_KEY_CURRENT_PAGE)
          );

          localStorage.setItem(
            Constants.CHANNEL_KEY_CURRENT_PAGE,
            JSON.stringify(currPg + 1)
          );
          currentPage = localStorage.getItem(
            Constants.CHANNEL_KEY_CURRENT_PAGE
          );
          if (user && props.platformId === "c101") {
            const channelsData = JSON.parse(
              localStorage.getItem(Constants.USER_CUSTOMIZED_CHANNEL_KEY)
            );
            pagedChannels = CommonFunctions.Paginate(
              channelsData,
              Constants.CHANNEL_PAGE_SIZE,
              parseInt(currentPage)
            );
          } else {
            const channelsData = JSON.parse(
              localStorage.getItem(Constants.CHANNEL_KEY)
            );
            pagedChannels = CommonFunctions.Paginate(
              channelsData,
              Constants.CHANNEL_PAGE_SIZE,
              parseInt(currentPage)
            );
          }
        }
      }
    }
  };

  /**
   * @param response It is asset schedules based on channels
   * @param channels It contains channel's basic data i.e title/logo etc
   * @param lastChannel It contains last channel record for epgNumber
   */
  const mapSchedules = (response, channels, lastChannel?) => {
    if (response) {
      let existingChannel = null;
      for (let channelsData of channels) {
        existingChannel = response.find(
          (res) => res.channel.id === channelsData.Id
        );
        if (!existingChannel.assetSchedules?.length) {
          existingChannel.channel.title = channelsData.title;
          existingChannel.channel.logo = channelsData.logo;
          existingChannel.epg = lastChannel?.egpNumber;
          existingChannel.assetSchedules = [
            {
              channelId: channelsData.Id,
              title: Constants.NO_SECHEDULER_DATA_TITLE,
              startDate: moment(props.selectedStartDateTime).utc(),
              endDate: moment(props.selectedEndDateTime).utc(),
              duration: Math.abs(
                moment(props.selectedStartDateTime)
                  .utc()
                  .diff(moment(props.selectedEndDateTime).utc(), "minutes")
              ),
            },
          ];
        } else {
          existingChannel.channel.title = channelsData.title;
          existingChannel.channel.logo = channelsData.logo;
          existingChannel.channel.epg = channelsData.platforms?.find(
            (cp) => cp.platformId === props.platformId
          ).epgNumber;
        }
      }
      let finalResponse = response.sort(
        (a, b) => {
          if (a.channel.epg - b.channel.epg === 0) return 1

          return a.channel.epg - b.channel.epg
        });

      // Converting Moment objects into strings.
      const r = channelHandler(finalResponse);
      timeCellScreenWidthHandler();

      const currentDate = parseInt(
        moment(selectedStartDateTime)
          .tz(Constants.TIME_ZONE)
          .format("DD"))

      const offsetWidth = scrollWidthMapper[currentDate - 1] || 0


      const data = calculateWidth(r, offsetWidth);
      assetSchedulesDispatch({
        type: Constants.UPDATE_ASSET_SCHEDULE_DATA,
        payload: data,
      });
      assetSchedulesDispatch({
        type: Constants.UPDATE_TOTAL_RECORDS,
        payload: channelListState.totalRecords,
      });
      assetSchedulesDispatch({
        type: Constants.UPDATE_CHANNEL_COUNT,
        payload: data?.length,
      });
      assetSchedulesDispatch({
        type: Constants.UPDATE_HAS_MORE,
      });
    } else {
      // Nothing found in the DB.
      mapNoDataFoundAgainstFilter();
    }

    isFetching.current = false

  };

  const mapNoDataFoundAgainstFilter = (
    isCustomizedChannel: boolean = false
  ) => {
    let response = [];
    response.push({
      channel: {
        id: "",
        title: "No Channel",
        logo: process.env.NEXT_PUBLIC_NO_IMAGE_URL,
      },
      assetSchedules: [
        {
          title: isCustomizedChannel
            ? Constants.NO_CUSTOMIZED_CHANNELS_DATA_FOUND
            : Constants.NO_SECHEDULER_DATA_TITLE,
          startDate: moment(props.selectedStartDateTime),
          endDate: moment(props.selectedEndDateTime),
          duration: Math.abs(
            moment(props.selectedStartDateTime)
              .utc()
              .diff(moment(props.selectedEndDateTime).utc(), "minutes")
          ),
          noProgramMode: isCustomizedChannel ? "disable-slot" : "",
          formattedStartDate: moment(props.selectedStartDateTime).format(
            Constants.TIME_FORMAT
          ),
          formattedEndDate: moment(props.selectedEndDateTime).format(
            Constants.TIME_FORMAT
          ),
        },
      ],
    });

    // Converting Moment objects into strings.
    const r = channelHandler(response);
    timeCellScreenWidthHandler();
    const data = calculateWidth(r);

    // Updating state variables
    assetSchedulesDispatch({
      type: Constants.UPDATE_ASSET_SCHEDULE_DATA,
      payload: data,
    });
    assetSchedulesDispatch({
      type: Constants.UPDATE_TOTAL_RECORDS,
      payload: channelListState.totalRecords,
    });
    assetSchedulesDispatch({
      type: Constants.UPDATE_CHANNEL_COUNT,
      payload: data.length,
    });
    assetSchedulesDispatch({
      type: Constants.UPDATE_HAS_MORE,
    });
  };

  const fetchAssetScheduleList = (cIds: any[]) => {
    return new Promise((resolve, reject) => {
      let url = `/schedule/list?platformId=${props.platformId}&selectedStartDateTime=${props.selectedStartDateTime}&selectedEndDateTime=${props.selectedEndDateTime}`;
      url += `&channelIds=${cIds.map((ch) => ch.Id).join(",")}`;

      if (props.genre) {
        url += `&category=${props.genre}`;
      }
      let req = new AxiosHelper(url);

      req
        .get()
        .then((res) => {
          resolve(res.data);
        })
        .catch((e) => reject(e));
    });
  };

  const renderSchedules = (channelsData, lastChannel) => {
    return new Promise((resolve, reject) => {
      fetchAssetScheduleList(channelsData).then((response: any) => {
        mapSchedules(response, channelsData, lastChannel);
        resolve(true);
      });
    });
  };

  const fetchCustomizedChannelsUserData = () => {
    return new Promise((resolve, reject) => {
      const user = CommonFunctions.GetLoggedInUser();
      //Checking if we have data stored in localstorage
      let customizedChannels = localStorage.getItem(
        Constants.USER_CUSTOMIZED_CHANNEL_KEY
      );
      if (customizedChannels) {
        customizedChannels = JSON.parse(
          localStorage.getItem(Constants.USER_CUSTOMIZED_CHANNEL_KEY)
        );
        resolve(customizedChannels);
      } else {
        const request = new AxiosHelper(`/userchannel/${user?.id}`);
        request
          .get()
          .then((response) => {
            localStorage.setItem(
              Constants.USER_CUSTOMIZED_CHANNEL_KEY,
              JSON.stringify(response)
            );
            resolve(response);
          })
          .catch((e) => {
            reject(e);
          });
      }
    });
  };

  const fetchChannelsDataForUser = () => {
    console.log("EXECUTING : fetchChannelsDataForUser")
    fetchCustomizedChannelsUserData()
      .then((customChannels: any) => {
        console.log("customChannels: ", customChannels);
        // //Now we have the customized channels..
        // dispatch({
        //   type: "UpdateTotalRecords",
        //   payload: customChannels?.data?.length,
        // });

        localStorage.setItem(
          "totalCount",
          JSON.stringify(customChannels?.data?.length)
        );

        let totalPages = Math.ceil(
          customChannels?.data?.length / Constants.CUSTOMIZED_CHANNEL_PAGE_SIZE
        );
        localStorage.setItem("totalPages", JSON.stringify(totalPages));

        let currentPage = localStorage.getItem("currentPage");
        if (!currentPage) {
          localStorage.setItem("currentPage", JSON.stringify(1));
        }
        currentPage = localStorage.getItem("currentPage");
        // const parsedCurrentPage  = parseInt(JSON.parse(currentPage));
        const parsedCurrentPage = currentActivePage;
        if (totalPages >= parsedCurrentPage) {
          setCurrentActivePage((prevState) => prevState + 1);
          const newChannels = CommonFunctions.Paginate(
            customChannels.data,
            Constants.CUSTOMIZED_CHANNEL_PAGE_SIZE,
            parsedCurrentPage
          );
          // dispatch({
          //   type: "UpdateChannelsCount",
          //   payload: newChannels.length,
          // });

          if (customChannels?.data?.length) {
            channelListDispatch({
              type: Constants.UPDATE_HAS_MORE,
              payload:
                [...channelListState.channelsData, ...newChannels].length <
                customChannels?.data?.length,
            });

            channelListDispatch({
              type: Constants.UPDATE_CHANNEL_LIST,
              payload: newChannels,
            });
            channelListDispatch({
              type: Constants.UPDATE_TOTAL_RECORDS,
              payload: customChannels?.data?.length,
            });

            channelListDispatch({
              type: Constants.UPDATE_CHANNEL_COUNT,
              payload: newChannels.length,
            });

            fetchAssetScheduleList(newChannels).then((response) => {
              mapSchedules(response, newChannels);
              localStorage.setItem(
                "currentPage",
                JSON.stringify(parsedCurrentPage + 1)
              );
            });
          } else {
            // Nothing found in the DB.
            mapNoDataFoundAgainstFilter(true);
          }
        } else {
          return;
        }

        // dispatch({
        //   type: "UpdateHasMore",
        // });
      })
      .catch((e) => {
        // Nothing found in the DB.
        mapNoDataFoundAgainstFilter(true);
      });

  };
  // const getAdClass = (index) => {
  //   if (index === 3) {
  //     setTimeout(showSecondAd, 2000);
  //     return "second-ad";
  //   }
  //   if (index === 11) {
  //     setTimeout(showFourthAd, 2000);
  //     return "fourth-ad";
  //   }
  //   if (index === 19) {
  //     setTimeout(showFifthAd, 2000)
  //     return "fifth-ad"
  //   }
  //   // if (index === 11) {
  //   //   setTimeout(showSecondAd, 2000);
  //   //   return "second-ad";
  //   // }
  //   // if(index === 19){
  //   //   setTimeout(showThirdAd,2000)
  //   //   return "first-ad"
  //   // }
  // };
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
    // if (index === 11) {
    //   setTimeout(showSecondAd, 2000);
    //   return "second-ad";
    // }
    // if(index === 19){
    //   setTimeout(showThirdAd,2000)
    //   return "first-ad"
    // }
  };

  useEffect(() => {
    showsRef.current = document.getElementById('showsHorizontal')
    timeRef.current = document.getElementById('time-cell')

    showsRef.current?.addEventListener('scroll', (e) => onListHorizontalScroll(e, 'showsHorizontal'))
    if(document.getElementsByClassName("jpx-mt-wrapper jpx-mt-main")[0]){
      setAdLength(true);
    }
    return () => {
      showsRef.current?.removeEventListener('scroll', (e) => onListHorizontalScroll(e, 'showsHorizontal'))
    }

  }, [])

  const onListHorizontalScroll = (e: any, id: string) => {

    const scrollthreshold = timeRef.current?.scrollWidth - 1700// 50% of total scroll length

    // if (isFetching.current) return

    if (id === 'showsHorizontal') {
      if (showsRef.current.scrollLeft > scrollthreshold && !isFetching.current) {
        isFetching.current = true
        props.onActiveDatedChanged()
        return
      }

      timeRef.current.scroll(showsRef.current.scrollLeft, 0)


      ////////// below logic is to update date ---------------------------
      const currentKey = Object.keys(scrollWidthMapperRef.current).find(key => scrollWidthMapperRef.current[key] - 600 > timeRef.current.scrollLeft)
      if (currentDateRef.current !== parseInt(currentKey)) {
        setCurrentDate(parseInt(currentKey));
      }
      ////////////////////////////////////////////////--------------------

      // fetch previous records enabler
      const fetchPreviousRecords = currentDateRef.current !== parseInt(currentKey) &&
        timeRef.current.scrollLeft <= scrollWidthMapperRef.current[currentDateRef.current - 1] &&
        timeRef.current.scrollLeft &&
        !isFetching.current


      if (fetchPreviousRecords) {
        isFetching.current = true
        props.onActiveDatedChanged(true)
      }
    }
  }

  const scheduleData = useMemo(() => {
    return assetSchedulesState.data
  }, [assetSchedulesState])


  const handleResize = () => {
    const data = calculateWidth(assestsRef.current, 0);
    assetSchedulesDispatch({
      type: Constants.UPDATE_RESIZE_SCHEDULE_DATA,
      payload: data,
    });
  };
  const debouncedChangeHandler = useMemo(() => debounce(handleResize, 300),
    // eslint-disable-next-line
    []);
  const hasWindow = typeof window !== "undefined";
  useEffect(() => {
    if (hasWindow) {
      window.addEventListener("resize", debouncedChangeHandler);
    }
    timeIntervalRef.current = setInterval(()=>{
      const bodyElement = document.getElementById('tv-guide-body')
      if(!bodyElement){
        handleResize()
        clearInterval(timeIntervalRef.current)
      }
    },1 * 1000)
    return () => debouncedChangeHandler.cancel();
  },
    // eslint - disable - next - line
    []);

  useEffect(() => {
    scrollWidthMapperRef.current = { ...scrollWidthMapper }
    currentDateRef.current = currentDate
    assestsRef.current = [...scheduleData]
  }, [scrollWidthMapper, currentDate, scheduleData])

  return (
    <div className="row mx-0">
      <div className="col-md-12 p-0">
        <div className="program-table-outer wrapper list">
          <div className="marker-overlay" id="marker-overlay"></div>
          <div className="time-bar bg-info hide" id="marker"></div>
          <div className="d-inline-flex flex-wrap w-100 channel-inner-wrapper">
            <div className="d-flex align-items-baseline channel-img light-gray-border">
              <InfiniteScroll
                key={-1}
                dataLength={channelListState.channelsData.length}
                next={
                  loggedInUser && props.platformId === "c101"
                    ? fetchChannelsDataForUser
                    : fetchMoreChannelsData
                }
                hasMore={channelListState.hasMore}
                loader={
                  <div className="d-flex justify-content-between w-100 skeltonBodyDiv mt-0">
                    <span style={{ width: "100%" }}>
                      <Skeleton
                        className="skeltonBody mb-0"
                        count={10}
                        height={90}
                      />
                    </span>
                  </div>
                }

              >
                {channelListState.channelsData?.map((item, index) => (
                  <Fragment key={index}>
                    <Link
                      href={`/channel/${item?.title.replaceAll(" ", "-")}`}
                      shallow
                      scroll={false}
                    >
                      <a>
                        <Image
                          className="AnimateImage"
                          key={index}
                          src={CommonFunctions.FormatImageSrc(item?.logo)}
                          width={110}
                          height={90}
                          alt={item?.title}
                        />
                      </a>
                    </Link>
                    <div
                      className={
                        showToggle && channelListState.indexValue === index
                          ? `null schedule-testing ${showAd !== 1 ? 'no-ad-toggle' : ''}`
                          : "null"
                      }
                    ></div>
                    {(adSpace && ((index === 3 || ((index - 3) % 8 === 0)) && index <= 44)) && <div className={`reserved-for-ads ${adLength && index === 3 ? 'extra-ad-length' : ''}`}>

This div is reserved for styling</div>}
                  </Fragment>
                ))}
              </InfiniteScroll>
            </div>

            <div id="showsHorizontal" className={`channel-slots-container assetSchedules autoOverflow `}>
              {scheduleData.map((channel, i) => {
                return (
                  <Fragment key={i}>
                    <div className="channel-row position-relative w-100">
                      {channel.assetSchedules?.map((schedule, ii) => {
                        return (
                          <Fragment key={i + ii}>

                            <div
                              className={`${collapseId === schedule.assetId
                                ? "active-cell "
                                : ""
                                }
                                  ${schedule.noProgramMode} position-absolute top-0 text-truncate cell program${schedule.actualMinute <= 15 ? " fifteenMinuteSlot" : ""}`}
                              aria-expanded="false"
                              style={{
                                transform: `translateX(${parseInt(
                                  schedule.translateX
                                )}px )`,
                                width: `${schedule.width}`,
                              }}
                              onClick={() => {
                                showCurrentToggledItem(schedule, i);
                                setShowAd((prevState) => prevState + 1);
                              }}
                              aria-controls={`${schedule.toggleId}`}
                              data-bs-toggle="collapse"
                              data-bs-target={`#${schedule.toggleId}`}
                            // onClick={() => showCurrentToggledItem(asset, index)}
                            >
                              <a className="pb-md-1 pb-0">
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
                          </Fragment>
                        );
                      })}
                    </div>
                    <div>
                      {channelListState.indexValue == i ? (
                        <div className="ZIndexPriority tv-guide-slot-container">
                          <ChannelTimeSlotToggle
                            key={channelListState.assetItem.scheduleId}
                            asset={channelListState.assetItem}
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
                          showToggle && channelListState.indexValue === i
                            ? `null schedule-testing ${showAd !== 1 ? 'no-ad-toggle' : ''}`
                            : "null"
                        }
                      ></div>
                    </div>
                    {/* {i === 3 || i === 11 || i === 19 ? (
                        <div className={getAdClass(i)} />
                      ) : null} */}
                    {((i === 3 || ((i - 3) % 8 === 0)) && i <= 44) ? <div className={getAdClass(i)} /> : null}
                  </Fragment>
                );
              })}
            </div>

            <div className="d-flex align-items-center channel-img third-empty-col-slot"></div>
          </div>

        </div>
      </div>
    </div>
  );
}