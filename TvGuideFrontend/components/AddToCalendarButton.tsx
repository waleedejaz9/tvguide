
import { atcb_init } from "add-to-calendar-button";
import "add-to-calendar-button/assets/css/atcb.css";
import React, { forwardRef, useEffect } from "react";
import moment from "moment-timezone";
import Constants from "../utils/helper/constants";


const AddToCalendarButton = (props, calendarRef) => {
  const { startDate, endDate, description, name, channelTitle } = props;

  useEffect(() => { 
    atcb_init() 
  }, []);

  return (
    <div className="atcb">
      {'{'}
      "name":"{`TV: ${name}`}",
      "description":"{`${description ? description.replace(/[^a-zA-Z0-9 ]/g, '') : '\n'}` || ""}\n\nReminder set courtesy of https://entertainmentdaily.co.uk/tv-guide",
      "startDate":"{moment(startDate).tz(Constants.TIME_ZONE).format("YYYY-MM-DD")}",
      "endDate":"{moment(endDate).tz(Constants.TIME_ZONE).format("YYYY-MM-DD")}",
      "startTime":"{moment(startDate).tz(Constants.TIME_ZONE).format("HH:mm")}",
      "endTime":"{moment(endDate).tz(Constants.TIME_ZONE).format("HH:mm")}",
      "trigger": "click",
      "location":"{channelTitle}",
      "label":"Add to Calendar",
      "options": [
      "Apple",
      "Google",
      "iCal",
      "Microsoft365",
      "Outlook.com",
      "MicrosoftTeams",
      "Yahoo"
      ],
      "timeZone":"{Constants.TIME_ZONE}",
      "iCalFileName":"Reminder-Event"
      {'}'}
    </div>
  );
};
export default forwardRef(AddToCalendarButton);