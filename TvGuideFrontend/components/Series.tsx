import Image from "next/image"
import Link from "next/link";
import Constants from "../utils/helper/constants";
import moment from "moment";
import { removeZeroMinutes } from "../utils/helper/timeFormatter";
import { CommonFunctions } from "../utils/common-functions";

export default function Series(props) {

  return (
    <>
      <Link
        key={props.scheduleId}
        href={`/asset/${props.assetId}/${props.scheduleId}`}
      >
        <div className="col-md-6 mb-4 series-show-item ">
          <div className="position-relative cursor-pointer">
            <div
              className="img-fluid w-100 series-program-img"
              style={
                props.assetImagePath !=
                "https://for-images.s3.eu-west-2.amazonaws.com/NA-Image.jpg"
                  ? { backgroundImage: `url(${props.assetImagePath})` }
                  : { backgroundImage: `url("/no-img.jpg")` }
              }
            ></div>
            <div className="position-absolute top-0 start-0 channel-logo">
              {/* Todo: will bind channel image   */}
              {props.assetChannelLogo && (
                <Image
                  key={props.scheduleId}
                  src={CommonFunctions.FormatImageSrc(props.assetChannelLogo)}
                  alt="channelLogo"
                  layout="fill"
                />
              )}
            </div>
            <div className="d-flex series-content-details overlay-img position-absolute top-0 start-0 h-100 text-white w-100">
              <div className="">
                <h5 className="mb-1">{props.assetName} </h5>
                <h6>
                  {`${
                    removeZeroMinutes(
                      moment(props.assetStartDate)
                        .tz(Constants.TIME_ZONE)
                        .format("h:mm A")
                    ).hours
                  }${
                    removeZeroMinutes(
                      moment(props.assetStartDate)
                        .tz(Constants.TIME_ZONE)
                        .format("h:mm A")
                    ).minutes
                  }${removeZeroMinutes(
                    moment(props.assetStartDate)
                      .tz(Constants.TIME_ZONE)
                      .format("h:mm A")
                  ).timeZone.toLowerCase()}`}{" "}
                  |{" "}
                  {moment(props.assetStartDate)
                    .tz(Constants.TIME_ZONE)
                    .format("dddd")}
                  {", "}
                  {moment(props.assetStartDate)
                    .tz(Constants.TIME_ZONE)
                    .format("MMMM D, YYYY")}
                </h6>
              </div>
              {/* <div className="">
                <h6 className="fs-sm">{props.assetDuration} mins</h6>
              </div> */}
            </div>
          </div>
        </div>
      </Link>
    </>
  );
}