import AxiosHelper from "../utils/helper/axios.helper";
import { useEffect, useReducer, useState, Fragment } from "react";
const {
  channelHandler,
  timeCellScreenWidthHandler,
  calculateWidth,
  showFirstAd,
} = require("../public/js/channelGrid");
import ChannelTimeSlotToggle from "./ChannelTimeSlotToggle";
import InfiniteScroll from "react-infinite-scroll-component";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import moment from "moment";
import Constants from "../utils/helper/constants";
import { CommonFunctions } from "../utils/common-functions";
import Image from "next/image";
import NoImg from "../public/no-img.jpg";
import { removeZeroMinutes } from "../utils/helper/timeFormatter";
import Link from "next/link";

export default function ChannelTimeSlot(props) {
  const defaultState = {
    channelsCount: 0,
    totalRecords: 0,
    channelsData: [],
    hasMore: true,
    nextEPGNumber: 0,
    assetItem: {},
    indexValue: null,
  };

  const sameActions = ["ResetState", "UpdateAssetToggle"];
  const [hideAd, setHideAd] = useState(false);

  // Reducer Function
  const reducer = (state, action) => {
    if (sameActions.includes(action.type)) {
      return { ...state, ...action.payload };
    } else if (action.type === "UpdateEPGNumber") {
      return {
        ...state,
        nextEPGNumber: action.payload,
      };
    } else if (action.type === "UpdateChannelData") {
      return {
        ...state,
        channelsData: state.channelsData.concat(action.payload),
      };
    } else if (action.type === "UpdateChannelsCount") {
      return {
        ...state,
        channelsCount: state.channelsCount + action.payload,
      };
    } else if (action.type === "UpdateTotalRecords") {
      return {
        ...state,
        totalRecords: action.payload,
      };
    } else if (action.type === "UpdateHasMore") {
      if (state.totalRecords === state.channelsCount) {
        return { ...state, hasMore: false };
      } else {
        return { ...state, hasMore: true };
      }
    }
    return state;
  };
  const [state, dispatch] = useReducer(reducer, defaultState);
  const [collapseId, setCollapseId] = useState<string | null>(null);
  useEffect(() => {
    if (
      !props.platformId ||
      !props.selectedStartDateTime ||
      !props.selectedEndDateTime
    )
      return;

    dispatch({ type: "ResetState", payload: defaultState });
    const user = CommonFunctions.GetLoggedInUser();
    if (user && props.platformId === "c101") {
      CommonFunctions.ResetCachedCustomizedChannels();
      // Fetch Customized Channels
      fetchChannelsDataForUser();
    } else {
      fetchMoreChannelsData();
    }
    // eslint-disable-next-line
  }, [
    props.platformId,
    props.genre,
    props.selectedStartDateTime,
    props.selectedEndDateTime,
  ]);

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

  const fetchMoreChannelsData = () => {
    const request = new AxiosHelper(
      `/channel/all/${props.platformId}/${state.nextEPGNumber}`
    );
    request
      .get()
      .then((channels) => {
        dispatch({
          type: "UpdateTotalRecords",
          payload: channels?.meta?.totalRecords,
        });

        dispatch({
          type: "UpdateChannelsCount",
          payload: channels?.data?.length,
        });

        dispatch({
          type: "UpdateHasMore",
        });
        if (channels.data?.length) {
          const c = channels.data[channels.data.length - 1].platforms.filter(
            (cp) => cp.platformId === props.platformId
          )[0];

          dispatch({
            type: "UpdateEPGNumber",
            payload: c.epgNumber,
          });

          fetchAssetScheduleList(channels.data).then((response: any) => {
            mapSchedules(response, channels.data, c);
          });
        }
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const showCurrentToggledItem = (asset, index) => {
    setCollapseId((prevState) => (prevState ? null : asset.assetId));
    dispatch({
      type: "UpdateAssetToggle",
      payload: { assetItem: asset, indexValue: index },
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
        //Now we have the customized channels..
        dispatch({
          type: "UpdateTotalRecords",
          payload: customChannels?.data?.length,
        });

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
        if (totalPages >= parseInt(JSON.parse(currentPage))) {
          currentPage = localStorage.getItem("currentPage");

          const newChannels = paginate(
            customChannels.data,
            Constants.CUSTOMIZED_CHANNEL_PAGE_SIZE,
            parseInt(JSON.parse(currentPage))
          );

          dispatch({
            type: "UpdateChannelsCount",
            payload: newChannels.length,
          });

          if (customChannels?.data?.length) {
            fetchAssetScheduleList(newChannels).then((response) => {
              mapSchedules(response, newChannels);
              localStorage.setItem(
                "currentPage",
                JSON.stringify(parseInt(currentPage) + 1)
              );
            });
          } else {
            // Nothing found in the DB.
            mapNoDataFoundAgainstFilter(true);
          }
        }

        dispatch({
          type: "UpdateHasMore",
        });
      })
      .catch((e) => {
        // Nothing found in the DB.
        mapNoDataFoundAgainstFilter(true);

        dispatch({
          type: "UpdateTotalRecords",
          payload: 0,
        });

        dispatch({
          type: "UpdateChannelsCount",
          payload: 0,
        });

        dispatch({
          type: "UpdateHasMore",
        });
      });
  };

  const fetchMore = async () => {
    if (state.channelsData.length > 0) {
      const user = CommonFunctions.GetLoggedInUser();
      if (user && props.platformId === "c101") {
        // Fetch Customized Channels
        await fetchChannelsDataForUser();
      } else {
        await fetchMoreChannelsData();
      }
    }
  };

  const paginate = (array, pageSize, pageNumber) => {
    return array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
  };

  const mapSchedules = (response, channels, c?) => {
    if (response) {
      let existingChannel = null;
      for (let channelsData of channels) {
        existingChannel = response.find(
          (res) => res.channel.id === channelsData.Id
        );
        if (!existingChannel.assetSchedules?.length) {
          existingChannel.channel.title = channelsData.title;
          existingChannel.channel.logo = channelsData.logo;
          existingChannel.epg = c?.epgNumber;
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

      dispatch({
        type: "UpdateChannelData",
        payload: data,
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
          channelId: "",
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
        },
      ],
    });

    // Converting Moment objects into strings.
    const r = channelHandler(response);
    timeCellScreenWidthHandler();
    const data = calculateWidth(r);

    dispatch({
      type: "UpdateChannelData",
      payload: data,
    });
  };

  const getAdClass = () => {
    setTimeout(showFirstAd, 2000);
    return "first-ad";
  };
  
  return (
    <>
      <div className="row mx-0">
        <div className="col-md-12 p-0">
          <div className="program-table-outer wrapper list">
            <div className="marker-overlay" id="marker-overlay"></div>
            <div className="time-bar bg-info hide" id="marker"></div>
            <InfiniteScroll
              dataLength={state.channelsData.length}
              next={fetchMore}
              hasMore={state.hasMore}
              loader={
                <div className="d-flex justify-content-between w-100 skeltonBodyDiv mt-3">
                  <span style={{ width: "19%" }}>
                    <Skeleton
                      className="skeltonBody mb-2"
                      count={10}
                      height={90}
                    />
                  </span>
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
              {state.channelsData?.map((item, index) => (
                <Fragment key={index}>
                  <div className="d-inline-flex flex-wrap w-100 channel-inner-wrapper" id={`div_ch_${index}`}>
                    <div className="d-flex align-items-center channel-img light-gray-border">
                      <Link
                        href={`/channel/${item?.title.replaceAll(" ", "-")}`}
                        shallow
                        scroll={false}
                      >
                        <a>
                          <Image
                            className="AnimateImage"
                            key={index}
                            src={CommonFunctions.FormatImageSrc(item?.logo ?? NoImg.src)}
                            width={110}
                            height={90}
                            alt={item?.title}
                          />
                        </a>
                      </Link>
                    </div>

                    <div className="channel-row position-relative assetSchedules">
                      {item?.assetSchedules?.map((asset, i) => (
                        <div
                          key={i}
                          className={`${
                            collapseId === asset.assetId ? "active-cell " : ""
                          }position-absolute top-0 text-truncate cell program ${
                            asset.lessContentClass
                          } ${asset.noProgramMode}${
                            asset.name ===
                            Constants.NO_CUSTOMIZED_CHANNELS_DATA_FOUND
                              ? " disable-toggle"
                              : ""
                          }`}
                          aria-expanded="false"
                          style={{
                            transform: `translateX(${asset.translateX})`,
                            width: `${asset.width}`,
                          }}
                          aria-controls={`${asset.toggleId}`}
                          data-bs-toggle="collapse"
                          data-bs-target={`#${asset.toggleId}`}
                          onClick={() => showCurrentToggledItem(asset, index)}
                        >
                          <a className="pb-md-1 pb-0">
                            <div className="show-details">
                              <h3 className="show-name">
                                {asset.name ===
                                Constants.NO_SECHEDULER_DATA_TITLE
                                  ? ""
                                  : asset.name}
                              </h3>
                              <p className="show-time">
                                {asset.name !==
                                  Constants.NO_SECHEDULER_DATA_TITLE &&
                                  `${
                                    removeZeroMinutes(asset.formattedStartDate)
                                      .hours
                                  }${
                                    removeZeroMinutes(asset.formattedStartDate)
                                      .minutes
                                  }${
                                    removeZeroMinutes(asset.formattedStartDate)
                                      .timeZone.toLowerCase()
                                  }`}
                              </p>
                            </div>
                          </a>
                        </div>
                      ))}
                    </div>

                    <div className="d-flex align-items-center channel-img"></div>

                    {state.indexValue == index ? (
                      <>
                        <ChannelTimeSlotToggle
                          hideAd={hideAd}
                          setHideAd ={setHideAd}
                          key={state.assetItem.scheduleId}
                          asset={state.assetItem}
                          parentId={index}
                        />
                      </>
                    ) : null}
                  </div>
                  {index === 3 && <div className={getAdClass()} />}
                </Fragment>
              ))}
            </InfiniteScroll>
          </div>
        </div>
      </div>
    </>
  );
}
