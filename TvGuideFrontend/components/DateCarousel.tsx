import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Constants from "../utils/helper/constants";
import { CarouselActionType } from "../utils/helper/enums";

export default function DateCarousel(props) {
  const { currentDate, onActiveDateChanged } = props;

  const [currentDay, setCurrentDay] = useState(currentDate);
  const [dates, setDates] = useState([]);
  const [activeDate, setActiveDate] = useState(
    moment().tz(Constants.TIME_ZONE).get("date")
  );
  const dateCarouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    createDatesCarousel();
  }, []);

  const createDatesCarousel = () => {
    let currentDate = moment().tz(Constants.TIME_ZONE).format(Constants.UTC_FORMAT_TIME);
    //Create Next 7 Days Dates
    let dates = [];
    let newDate = null;
    for (let date = 0; date < 14; date++) {
      newDate = moment(currentDate).tz(Constants.TIME_ZONE).add(date, "days").format(Constants.UTC_FORMAT_TIME);
      dates.push({
        day: moment(newDate).tz(Constants.TIME_ZONE).format("ddd"),
        date: newDate,
      });
    }
    setDates(dates);
  };

  const moveLeftRightDateCarousel = (actionType: CarouselActionType) => {
    if (actionType === CarouselActionType.left) {
      dateCarouselRef.current.scrollLeft -= 200;
    } else if (actionType === CarouselActionType.right) {
      dateCarouselRef.current.scrollLeft += 200;
    }
  };

  const setIsActiveDate = (clickedDate) => {
    setCurrentDay(null);
    setActiveDate(clickedDate.get("date"));
    onActiveDateChanged(clickedDate);
  };

  useEffect(() => {
    setCurrentDay(currentDate);
  }, [currentDate]);
  
  const getTimezoneDate = (date) =>{
   return moment(date).tz(Constants.TIME_ZONE).get("date")
  }

  return (
    <div className="prog-scrollbar d-flex justify-content-between bg-white fs-md date-picker align-items-center">
      <div className="date-slot-slide-left">
        <button id="slideDateLeft" type="button" className="w-25 slide-left left-btn text-start btn bg-white text-secondary"
          onClick={() => {
            moveLeftRightDateCarousel(CarouselActionType.left);
          }}
        >
          <FontAwesomeIcon className="icon" icon={faChevronLeft}></FontAwesomeIcon>
        </button>
      </div>
      <div className="calendar-day-slots" ref={dateCarouselRef}>
        {dates.map((currentDate, i) =>{
          return (
            <a
            key={i}
            id={`date-${moment(currentDate.date).tz(Constants.TIME_ZONE).format("MMDD")}`}
            className={`position-relative prog ${
              getTimezoneDate(currentDate.date) === currentDay
                ? `active-date`
                : ``
            } fs-sm text-secondary`}
            onClick={() => setIsActiveDate(moment(currentDate.date))}
          >
            <div className="date-cell">
              <span className="day">{currentDate.day}</span>
              <span className="date-no">
                {getTimezoneDate(currentDate.date)}
              </span>
            </div>
          </a>
          )
        })}
      </div>
      <div className="date-slot-slide-right">
        <button
          id="slideDateRight"
          type="button"
          className="btn bg-white text-secondary"
          onClick={() => moveLeftRightDateCarousel(CarouselActionType.right)}
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
    </div>
  );
}
