import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment, { Moment } from 'moment-timezone'
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Constants from "../utils/helper/constants";
import { CarouselActionType } from "../utils/helper/enums";
import debounce from "lodash.debounce";
import { removeZeroMinutes } from "../utils/helper/timeFormatter";

export default function TimeCarousel(props) {

  const { timePickerDateTime, timePickerEndDateTime , times , setTimes, currentDate, setCurrentDate } = props


  const hasWindow = typeof window !== "undefined";

  const handleResize = () => {
    // createTimeCarousel(CarouselActionType.none, props.timePickerDateTime);
  };

  const debouncedChangeHandler = useMemo(() => debounce(handleResize, 300),
    // eslint-disable-next-line
  []);

  useEffect(() => {
    createTimeCarousel(CarouselActionType.none, timePickerDateTime);
  },[currentDate, timePickerDateTime, timePickerEndDateTime]);


  // useEffect(() => {
  //   if (hasWindow) {
  //     window.addEventListener("resize", debouncedChangeHandler);
  //   }
  //   return () => debouncedChangeHandler.cancel();
  // },
  //   //eslint-disable-next-line
  //   []);
  const createTimeCarousel = (carouselAction: CarouselActionType,timePickerDateTime: string = null) => {
    let currentDay = moment().tz(Constants.TIME_ZONE).format(Constants.UTC_FORMAT_TIME);
    if (timePickerDateTime) currentDay = timePickerDateTime;
    const currentMinutes = moment(currentDay).get("minutes");
    mapTimeState();
  };

  const mapTimeState = () => {
    let currentTimes = [];
    let time = moment(timePickerDateTime).tz(Constants.TIME_ZONE);
    while (time <= moment(timePickerEndDateTime).tz(Constants.TIME_ZONE)) {
      currentTimes.push(time);
      time = moment(time).add(Constants.SLOT_INTERVAL, "minutes")
    }
    setTimes(currentTimes);
  };

  // const moveLeftRightTimeCarousel = (actionType: CarouselActionType) => {
  //   createTimeCarousel(actionType);
  // };

  const handleCrouselMovement = (direction: string) => {
    const showsRef = document.getElementById('showsHorizontal')
    const timeRef = document.getElementById('time-cell')
    let scrollValue = timeRef.offsetWidth * 0.6
    if (showsRef && timeRef) {
      if (direction === CarouselActionType.left) {
        showsRef.scrollTo(timeRef.scrollLeft - scrollValue, 0)
      }
      else if (direction === CarouselActionType.right) {
        showsRef.scrollTo(timeRef.scrollLeft + scrollValue, 0)
      }
    }
  }

  
  return (  
      <div id="time" className="d-flex time-scroll justify-content-between align-items-center"
      >
        <div className="timeBlockScroll"></div>
        <div className="time-slot-slide-left">
          <button
            id="slideLeft"
            type="button"
            onClick={() => handleCrouselMovement(CarouselActionType.left)}
            className="slide-left text-start left-btn btn bg-white text-secondary"
          >
            <FontAwesomeIcon
              className="icon"
              icon={faChevronLeft}
            ></FontAwesomeIcon>
          </button>
        </div>
        <div id="time-cell" className="d-flex autoOverflow">
          {times.map((time, index) => (
            <Link href="/" key={index} shallow scroll={false}>
              <a
                data-datetime={time
                  .tz(Constants.TIME_ZONE)
                  .format(Constants.UTC_FORMAT_TIME)}
                data-date={time
                  .tz(Constants.TIME_ZONE)
                  .format("MMDD")}
                className="fs-sm time-cell text-secondary ps-3 schedule-time-slots"
              >
                {`${removeZeroMinutes(time.tz(Constants.TIME_ZONE).format("h:mm A"))
                  .hours
                  }${removeZeroMinutes(time.tz(Constants.TIME_ZONE).format("h:mm A"))
                    .minutes
                  }${removeZeroMinutes(time.tz(Constants.TIME_ZONE).format("h:mm A"))
                    .timeZone.toLowerCase()
                  }`}
              </a>
            </Link>
          ))}
        </div>
        <div className="time-slot-slide-right">
          <button
            id="slideRight"
            type="button"
            onClick={() => handleCrouselMovement(CarouselActionType.right)}
            // onClick={(e) => {e.preventDefault(); moveLeftRightTimeCarousel(CarouselActionType.right)}}
            className="btn bg-white text-secondary"
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      </div>
  );
}