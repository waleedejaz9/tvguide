import Link from "next/link";
import Image from "next/image";
import NoImg from "../public/no-img.jpg";
import OneChannelSlot from "./OneChannelSlot";
import AxiosHelper from "../utils/helper/axios.helper";
import ChannelTimeSlotToggle from "./ChannelTimeSlotToggle";
import { useEffect, useReducer, useState, Fragment } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Constants from "../utils/helper/constants";
import moment from "moment";
import { CommonFunctions } from "../utils/common-functions";
const {
  channelHandler,
  timeCellScreenWidthHandler,
  calculateWidth,
  showFirstAd,
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
  const [loggedInUser, setLoggedInUser] = useState(false);
  const [currentActivePage, setCurrentActivePage] = useState(1);
  const sameActions = "UpdateAssetToggle";
  const [collapseId, setCollapseId] = useState<string | null>(null);
  const [hideAd, setHideAd] = useState(false);

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
      return {
        ...state,
        data: state.data.concat(action.payload),
      };
    } else if (action.type === Constants.RESET_STATE) {
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
    setCollapseId((prevState) => (prevState ? null : asset.assetId));
    channelListDispatch({
      type: "UpdateAssetToggle",
      payload: { assetItem: asset, indexValue: index },
    });
  };
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
  }, [props.platformId, props.genre]);

  //This is being used for fetching schedules only when we have channels and date/time gets changed.
  useEffect(() => {
    if (
      !schedulesOnDateTimeFilter ||
      !props.selectedStartDateTime ||
      !props.selectedEndDateTime
    )
      return;
    console.log("schedules called for this");
    assetSchedulesDispatch({
      type: Constants.RESET_STATE,
      payload: assetScheduleListDefaultState,
    });
    CommonFunctions.ResetDefaultChannelPageCounter();
    fetchMoreSchedulesData();
    // eslint-disable-next-line
  }, [props.selectedStartDateTime, props.selectedEndDateTime]);

  const fetchMoreChannelsData = () => {
    const request = new AxiosHelper(
      `/channel/all/${props.platformId}/${props.genre}/${channelListState.nextEPGNumber}`
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
      if (!currentPage) {
        localStorage.setItem(
          Constants.CHANNEL_KEY_CURRENT_PAGE,
          JSON.stringify(1)
        );
      }
      currentPage = localStorage.getItem(Constants.CHANNEL_KEY_CURRENT_PAGE);
      if (totalPages >= parseInt(JSON.parse(currentPage))) {
        currentPage = localStorage.getItem(Constants.CHANNEL_KEY_CURRENT_PAGE);

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
        (a, b) => a.channel.epg - b.channel.epg
      );
      // Converting Moment objects into strings.
      const r = channelHandler(finalResponse);
      timeCellScreenWidthHandler();
      const data = calculateWidth(r);
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
    } else {
      // Nothing found in the DB.
      mapNoDataFoundAgainstFilter();
    }
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
  const getAdClass = () => {
    setTimeout(showFirstAd, 2000);
    return "first-ad";
  };
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
                        className="skeltonBody mb-2"
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
                  </Fragment>
                ))}
              </InfiniteScroll>
            </div>

            <div className="channel-slots-container assetSchedules">
              <InfiniteScroll
                key={1}
                dataLength={channelListState.channelsData.length}
                next={() => {
                  console.log("hi schedules");
                }}
                hasMore={channelListState.hasMore}
                loader={
                  <div className="d-flex justify-content-between w-100 skeltonBodyDiv mt-3">
                    <span style={{ width: "80%" }}>
                      <Skeleton
                        className="skeltonBody mb-2"
                        count={10}
                        height={90}
                      />
                    </span>
                  </div>
                }
              >
                {assetSchedulesState.data.map((channel, i) => {
                  return (
                    <Fragment key={i}>
                      <div className="channel-row position-relative w-100">
                        {channel.assetSchedules?.map((schedule, ii) => {
                          return (
                            <Fragment key={i + ii}>
                              <div
                                className={`${
                                  collapseId === schedule.assetId
                                    ? "active-cell "
                                    : ""
                                }position-absolute top-0 text-truncate cell program `}
                                aria-expanded="false"
                                style={{
                                  transform: `translateX(${schedule.translateX})`,
                                  width: `${schedule.width}`,
                                }}
                                onClick={() =>
                                  showCurrentToggledItem(schedule, i)
                                }
                                aria-controls={`${schedule.toggleId}`}
                                data-bs-toggle="collapse"
                                data-bs-target={`#${schedule.toggleId}`}
                                // onClick={() => showCurrentToggledItem(asset, index)}
                              >
                                <a className="pb-md-1 pb-0">
                                  <div className="show-details">
                                    <h3 className="show-name">
                                      {schedule.name}
                                    </h3>
                                    <p className="show-time">
                                      {schedule.formattedStartDate}
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
                          <div className="position-absolute start-0 w-100 ZIndexPriority">
                            <ChannelTimeSlotToggle
                              key={channelListState.assetItem.scheduleId}
                              asset={channelListState.assetItem}
                              parentId={i}
                              hideAd={hideAd}
                              setHideAd={setHideAd}
                            />
                          </div>
                        ) : null}
                      </div>
                      {i === 3 && <div className={getAdClass()} />}
                    </Fragment>
                  );
                })}
              </InfiniteScroll>
            </div>

            <div className="d-flex align-items-center channel-img"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
