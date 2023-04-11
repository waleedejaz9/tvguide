import Image from "next/image";
import AxiosHelper from "../../utils/helper/axios.helper";
import AddToCalendarButton from "../../components/AddToCalendarButton";
import ReadOnlyRating from "../../components/ReadOnlyRating";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import moment from "moment-timezone";
import Constants from "../../utils/helper/constants";
import Link from "next/link";
import { removeZeroMinutes } from "../../utils/helper/timeFormatter";
import Calender from "./../../public/MobileCalender.png";
import { CommonFunctions } from "../../utils/common-functions";
import { GetServerSideProps } from 'next';

export default function Channel({channelAssetSchedules}: any) {
  return (
    <>
      <div className="program-container">
        <div className="bbc-head">
          <div className="bbc-logo">
            {channelAssetSchedules && channelAssetSchedules.channel && (
              <Image
                src={CommonFunctions.FormatImageSrc(channelAssetSchedules.channel?.logo)}
                alt={channelAssetSchedules.channel?.title}
                width={200}
                height={200}
              />
            )}
          </div>
          <div className="txt-bbc-one">
            <h2>
              {channelAssetSchedules && channelAssetSchedules.channel?.title}
            </h2>
            <p>
              {moment().tz(Constants.TIME_ZONE).format("dddd")},{" "}
              {moment().tz(Constants.TIME_ZONE).format("MMMM D, YYYY")}
            </p>
          </div>
        </div>
        <div className="divider"></div>
        {channelAssetSchedules &&
          channelAssetSchedules.assetSchedules &&
          channelAssetSchedules.assetSchedules.map((program, index) => (
            <div className="programs" key={index}>

              <div className="s-prog">
                <div className="program-poster">
                  <Link href={`/tv-guide/asset/${program.assetId}/${program.scheduleId}`}>
                    <Image
                      src={CommonFunctions.FormatImageSrc(program.image)}
                      alt={program.title}
                      width={465}
                      height={250}
                    />
                  </Link>
                </div>
                <div className="program-details">
                  <div>
                    <p className="time">

                      <>
                        {`${removeZeroMinutes(moment(program.startDate).tz(Constants.TIME_ZONE).format("h:mmA")).hours}${removeZeroMinutes(moment(program.startDate).tz(Constants.TIME_ZONE).format("h:mm A")).minutes}${removeZeroMinutes(moment(program.startDate).tz(Constants.TIME_ZONE).format("h:mm A")).timeZone.toLowerCase()}`
                        }
                      </>
                    </p>
                    <Link href={`/asset/${program.assetId}/${program.scheduleId}`}><h2 className="program-name">{program.title}</h2></Link>
                    <p className="program-desc">{program.summary.slice(0, 200)} {
                      program.summary.length > 200 && (
                        <span className="read-more-link">
                          <a
                            className="pb-md-1 pb-0"
                            href={`/tv-guide/asset/${program.assetId}/${program.scheduleId}`}
                          >
                            {" "}
                            Read more
                          </a>
                        </span>
                      )}</p>
                  </div>

                  <div className="program-rating-add">
                    <div className="program-rating">
                      <p>{program.rating}</p>
                      <div className="rating-stars">
                        <ReadOnlyRating
                          assetTitle={program.title}
                          ratingClassWrapper="d-flex align-items-center TourGolf_Rating"
                          AverageRatingValueH2Class="me-3 rate-text"
                          AverageRatingValueSpanClass="rating-value"
                          ratingComponentClass="rating-stars"
                          VotesClass="text-secondary votes"
                        />
                      </div>
                    </div>
                    <div className="add-cart">
                      {/* <div className="AddcalanderImageShow d-inline-block">
                        <Image
                          className="d-block w-full h-auto cursor-pointer"
                          src={Calender}
                          alt="Calender"
                        />
                      </div> */}
                      <div className="links d-inline-flex flex-sm-row flex-column">
                        <div className="fw-normal TourGolf_AddCalender_text TourGolf_FontColor d-inline-block">
                          <div className="links">
                            <AddToCalendarButton
                            name={program.title}
                            description={program.summary}
                            startDate={program.startDate}
                            endDate={program.endDate}
                            channelTitle={channelAssetSchedules.channel?.title}
                            />
                          </div>
                        </div>                      
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </>
  );
}



export const getServerSideProps: GetServerSideProps = async (context) => {
  let title = context?.query?.title ? context?.query?.title.toString() : "";
  title = title.replace(/-/gi, " ");

  const request = new AxiosHelper(`/channel/${encodeURIComponent(title)}`);
  let response = await request.get();
  return {
    props: {
      channelAssetSchedules: response?.data || []
    }
  }
}