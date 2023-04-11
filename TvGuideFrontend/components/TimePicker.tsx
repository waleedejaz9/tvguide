import React, { useEffect, useState } from "react";
import Link from 'next/link';
import Constants from "../utils/helper/constants";
import moment from "moment";

export default function TimePicker(props) {
  const [times, setTimes] = useState([]);
  const [activeTime, setActiveTime] = useState(null);
  // TODO: Refactoring Required.
  useEffect(() => {
    const currentDate = moment().tz(Constants.TIME_ZONE);
    currentDate.set("minutes", 0);
    let runningTime = moment().tz(Constants.TIME_ZONE);
    let times = [];
    for (let i = currentDate.hours(); i < 24; i++) {
      runningTime.set("hours", i);
      runningTime.set("minutes", 0);
      runningTime.set("seconds", 0);
      runningTime.format("ha");
      times.push(runningTime.format("ha"));
    }
    setTimes(times);
    setActiveTime(currentDate.format("ha"));
  }, []);

  const checkedIsActive = (i) => {
    setActiveTime(i);
    let time = moment(i, ["h A"]).format("HH:mm");
    props.onCurrentTimeListClicked(time)
  };

  const setDefaults = (currentlySelectedTime: string) => {
    let time = moment(currentlySelectedTime, ["h A"]).format("HH:mm");
    let endDate = moment().tz(Constants.TIME_ZONE);
    endDate.set("hours", parseInt(time));
    endDate.set("minutes", Constants.INTERVAL_RANGE);
    endDate.set("seconds", 0);

    let startDate = moment().tz(Constants.TIME_ZONE);
    startDate.set("hours", parseInt(time));
    startDate.set("minutes", 0);
    startDate.set("seconds", 0);
    props.onCurrentTimeListClicked({
      startDateTime: startDate.format(Constants.UTC_FORMAT_TIME),
      endDateTime: endDate.format(Constants.UTC_FORMAT_TIME),
    });
  };

  return (
    <div className="nav-item dropdown haider">
      <Link href="/" shallow scroll={false}>
        <a
          className="nav-link dropdown-toggle fs-md"
          id="currentTimeLink"
          role="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          Today at {activeTime}
        </a>
      </Link>
      <ul
        className="dropdown-menu p-2 border-0 shadow-sm fs-md time-dropdown timePicker"
        aria-labelledby="currentTimeLink"
      >
        {times.map((t, i) => (
          <li key={`${i}`}>
            <a className="dropdown-item" onClick={() => checkedIsActive(t)}>
              <div className="form-check" onChange={() => checkedIsActive(t)}>
                <input
                  className="form-check-input"
                  type="radio"
                  name={`today${i}`}
                  id={`today${i}`}
                  onChange={() => checkedIsActive(t)}
                  checked={activeTime === t}
                />
                <label className="form-check-label" htmlFor={`today${i}`}>
                  {t}
                </label>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}