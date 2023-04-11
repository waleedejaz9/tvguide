import Image from "next/image";
import MobileCalender from "../public/MobileCalender.png";
// import Calender from "../public/Calender.png";
import Calender from "../public/MobileCalender.png";
import ANTMountain from "../public/ANTMountain.png";
import moment from "moment";
import Constants from "../utils/helper/constants";
import Link from "next/link";
import AddToCalendarButton from "./AddToCalendarButton";
import ReadOnlyRating from "./ReadOnlyRating";
import NoImg from "../public/no-img.jpg";
import { useEffect, useRef, useState } from "react";
import { removeZeroMinutes } from "../utils/helper/timeFormatter";
import { CommonFunctions } from "../utils/common-functions";

const { showSecondAd } = require("../public/js/channelGrid");

export default function ChannelTimeSlotToggle(props) {
  const { asset, parentId } = props;

  const calenderRef = useRef(null);

  const onCalenderImageClick = () => {
    calenderRef.current?.children?.[0]?.children?.[0]?.dispatchEvent(
      new Event("mousedown")
    );
  };

  useEffect(() => {
    if (!props.hideAd) {
      setTimeout(showSecondAd, 2000);
      props.setHideAd(true);
    }
  }, [props]);

  if (asset) {

    return (
      <div
        id={`${asset?.toggleId}`}
        className="accordion-collapse collapse show"
        aria-labelledby={`${asset?.toggleId}`}
        data-bs-parent={`#div_ch_${parentId}`}
      >
        <div className="accordion-body bg-light row mx-0 py-0 px-0">
          <div className="TourGolf_Section">
            <div className="w-100 PgaSection mx-auto">
              <div className="d-flex flex-md-row flex-column channel-slot-content">
                <div className="channel-slot-img-content">
                  <div className="TourGolf_PlayerImage d-none d-md-block">

                    {asset?.assetImage && (
                      <Link
                        className="pb-md-1 pb-0"
                        href={`/asset/${asset?.assetId}/${asset?.scheduleId}/${CommonFunctions.FormatUrl(asset?.name)}`}
                      >
                        <a>
                          {asset?.assetImage && (
                            <Image
                              className="TourGolf_PlayerImg"
                              src={`${CommonFunctions.FormatImageSrc(asset?.assetImage)}`}
                              alt="Golf Player"
                              layout="fill"
                            />
                          )}
                        </a>
                      </Link>
                    )}
                    {asset?.assetImage == "undefined" ||
                      (asset?.assetImage == "" && (
                        <Link
                          className="pb-md-1 pb-0"
                          href={`/asset/${asset?.assetId}/${asset?.scheduleId}/${CommonFunctions.FormatUrl(asset?.name)}`}
                        >
                          <a>
                            {asset?.assetImage && (
                              <Image
                                className="TourGolf_PlayerImg"
                                src={`${CommonFunctions.FormatImageSrc(NoImg?.src)}`}
                                alt="Golf Player"
                                layout="fill"
                                width={30}
                                height={80}
                              />
                            )}
                          </a>
                        </Link>
                      ))}
                  </div>
                  <div className="mobileView_playerImage d-md-none">
                    {asset?.assetImage && (
                      <Link
                        className="pb-md-1 pb-0"
                        href={`/asset/${asset?.assetId}/${asset?.scheduleId}/${CommonFunctions.FormatUrl(asset?.name)}`}
                      >
                        <a>
                          {asset?.assetImage && (
                            <Image
                              className="TourGolf_PlayerImg"
                              src={`${CommonFunctions.FormatImageSrc(asset?.assetImage)}`}
                              alt="Golf Player"
                              layout="fill"
                            />
                          )}
                        </a>
                      </Link>
                    )}
                    {asset?.assetImage == "undefined" ||
                      (asset?.assetImage == "" && (
                        <Link
                          className="pb-md-1 pb-0"
                          href={`/asset/${asset?.assetId}/${asset?.scheduleId}/${CommonFunctions.FormatUrl(asset?.name)}`}
                        >
                          <a>
                            {asset?.assetImage && (
                              <Image
                                className="TourGolf_PlayerImg"
                                src={`${CommonFunctions.FormatImageSrc(NoImg?.src)}`}
                                alt="Golf Player"
                                layout="fill"
                                width={30}
                                height={80}
                              />
                            )}
                          </a>
                        </Link>
                      ))}
                  </div>
                  <div className="TourGolf_Section_CenterText px-5">
                    <Link
                      className="pb-md-1 pb-0"
                      href={`/asset/${asset?.assetId}/${asset?.scheduleId}/${CommonFunctions.FormatUrl(asset?.name)}`}
                    >
                      <h2 className="TourGolf_mainHeading TourGolf_FontColor">
                        {asset?.name}
                      </h2>
                    </Link>
                    <p className="TourGolf_timings fw-normal TourGolf_FontColor">
                      {`${removeZeroMinutes(asset?.formattedStartDate)?.hours
                        }${removeZeroMinutes(asset?.formattedStartDate)?.minutes
                        }${removeZeroMinutes(asset?.formattedStartDate)?.timeZone.toLowerCase()
                        }`}{" "}
                      -  {`${removeZeroMinutes(asset?.formattedEndDate)?.hours
                        }${removeZeroMinutes(asset?.formattedEndDate)?.minutes
                        }${removeZeroMinutes(asset?.formattedEndDate)?.timeZone.toLowerCase()
                        }`} |{" "}
                      {moment(asset?.startDate)
                        .tz(Constants.TIME_ZONE)
                        .format("dddd")}{", "}
                      {moment(asset?.startDate)
                        .tz(Constants.TIME_ZONE)
                        .format("MMMM D, YYYY")}
                    </p>
                    <div className="TourGolf_dividerLine"></div>

                    <p className="TourGolf_text fw-light TourGolf_FontColor">
                      <span>
                        {asset?.description &&
                          asset?.description.slice(0, 120)}
                      </span>
                      {asset?.description &&
                        asset?.description.length > 120 && (
                          <span className="read-more-link">
                            <span>...</span>
                            <a
                              key={asset?.toggleId}
                              className="pb-md-1 pb-0"
                              href={`/tv-guide/asset/${asset?.assetId}/${asset?.scheduleId}/${CommonFunctions.FormatUrl(asset?.name)}`}
                            >
                              {" "}
                              Read more
                            </a>
                          </span>
                        )}
                    </p>
                    <div className="TourGolf_lowerPart">
                      {/* Faiza ask for hide rating from channel time slot toggle that's why I comment it */}
                        {/* <ReadOnlyRating
                          assetTitle={asset?.name}
                          ratingClassWrapper="d-flex align-items-center TourGolf_Rating"
                          AverageRatingValueH2Class="me-3 rate-text"
                          AverageRatingValueSpanClass="rating-value"
                          ratingComponentClass="rating-stars"
                          VotesClass="text-secondary votes"
                          stars={true}
                          votes={true}
                        /> */}
                      {/* Faiza ask for hide rating from channel time slot toggle that's why I comment it */}
                      <div className="TourGolf_AddCalender">
                        {/* <Image
                          className="d-sm-none mobileCalenderImage cursor-pointer"
                          src={Calender}
                          alt="Calender"
                          onClick={onCalenderImageClick}
                        /> */}
                        {/* <div className="AddcalanderImageShow d-inline-block">
                          <Image
                            className="d-block w-full h-auto cursor-pointer"
                            src={Calender}
                            alt="Calender"
                            onClick={onCalenderImageClick}
                          />
                        </div> */}
                        <div className="fw-normal TourGolf_AddCalender_text TourGolf_FontColor d-inline-block">
                          <div className="links">
                            <AddToCalendarButton
                              name={asset?.name}
                              description={asset?.description}
                              startDate={asset?.startDate}
                              endDate={asset?.endDate}
                              ref={calenderRef}
                              channelTitle = {props.channelTitle}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
               {props.showAd === 1 && <div className="second-ad"></div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return <div></div>;
  }
}
