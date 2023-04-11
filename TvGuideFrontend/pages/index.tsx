import TimeCarousel from '../components/TimeCarousel';
import AssetCategoryDesktop from '../components/AssetCategories';
import AssetCategoryMobile from '../components/AssetCategoriesMobile';
import Platforms from '../components/Platforms';
import { useState, useEffect, useReducer, useMemo } from 'react';
import TimePicker from '../components/TimePicker';
import DateCarousel from '../components/DateCarousel';
import Constants from '../utils/helper/constants';
import moment, { Moment } from "moment";
import ChannelTimeSlot from '../components/ChannelTimeSlot';
import ChannelTimeSlotV2 from './../components/ChannelTimeSlotV3';
import { GetServerSideProps } from 'next';
import AxiosHelper from '../utils/helper/axios.helper';

interface Props {
  categories: any,
  platforms: any
}

export default function Home({categories, platforms}: Props) {

  const defaultCalendarDate = useMemo(()=>{
    const minuts = moment.duration(moment().tz(Constants.TIME_ZONE).format("HH:mm")).asMinutes()
    const currentMinutes = moment().tz(Constants.TIME_ZONE).get("minutes") > 30 ? 30 : 0;
    const startDate = moment().tz(Constants.TIME_ZONE).set("minute", currentMinutes).set("second", 0);
    const endDate = moment().tz(Constants.TIME_ZONE).set("second", 0).add(Constants.INTERVAL_RANGE - (minuts + 30), "minute");
    return {
      startRange: startDate.tz(Constants.TIME_ZONE).format(Constants.UTC_FORMAT_TIME),
      endRange: endDate.tz(Constants.TIME_ZONE).format(Constants.UTC_FORMAT_TIME)
    }
  }, [])

  const [currentDate, setCurrentDate] = useState(parseInt(moment().tz(Constants.TIME_ZONE).format("DD")))
  const [times, setTimes] = useState<Moment[]>([]);
  const [scrollWidthMapper, setScrollWidthMapper] = useState({});
  const [genre, setGenre] = useState(Constants.DEFAULT_GENRE);
  const [platform, setPlatform] = useState("");
  const [selectedTimePickerDateTimeRange, setDateTime] = useState<any>(defaultCalendarDate);

  const formatDate = (date) =>{
    return moment(date).subtract(1, 'days').tz(Constants.TIME_ZONE).format(Constants.UTC_FORMAT_TIME);
  }

  const assetCategoryChanged = (selectedCategory) => {
    setGenre(selectedCategory);
  };

  const setSelectedTimePicker = (minuts: number) => {
    const currentMinutes = moment().tz(Constants.TIME_ZONE).get("minutes") > 30 ? 30 : 0;

    const startDate = selectedTimePickerDateTimeRange.startRange ?
      moment(selectedTimePickerDateTimeRange.endRange).tz(Constants.TIME_ZONE).add(30, "minute")
      :
      moment().tz(Constants.TIME_ZONE).set("minute", currentMinutes).set("second", 0);

    const endDate = selectedTimePickerDateTimeRange.endRange ?
      moment(selectedTimePickerDateTimeRange.endRange).tz(Constants.TIME_ZONE).add(1, 'd')
      :
      moment().tz(Constants.TIME_ZONE).set("second", 0).add(Constants.INTERVAL_RANGE - (minuts + 30), "minute");

      setDateTime({
        startRange: startDate.tz(Constants.TIME_ZONE).format(Constants.UTC_FORMAT_TIME),
        endRange: endDate.tz(Constants.TIME_ZONE).format(Constants.UTC_FORMAT_TIME)
      })
  }

  useEffect(() => {
    const timeRef = document.getElementById('time-cell');
    const currentDate = moment(selectedTimePickerDateTimeRange.startRange).tz(Constants.TIME_ZONE).format("DD");
    if (currentDate !== "Invalid date" && times.length && !scrollWidthMapper.hasOwnProperty(currentDate)) {
      setScrollWidthMapper[currentDate] = timeRef.scrollWidth;
    }
  }, [times])

  const currentTimeListClicked = (time) => {
    // moment() will only take the date from browser until pass some valid date as an argument
    const startDate = moment().tz(Constants.TIME_ZONE);
    startDate.set("hours", parseInt(time));
    startDate.set("minutes", 0);
    startDate.set("seconds", 0);
    setDateTime((prevDateTime) => ({
      startRange: startDate.format(Constants.UTC_FORMAT_TIME),
      endRange: prevDateTime.endRange,
    }));
  };

  const onActiveDatedChanged = (isPrevious: boolean = false) => {
    if (isPrevious) {
      setDateTime((prevTimeRange) => {
        let startRange = formatDate(prevTimeRange.startRange);
        let endRange = formatDate(prevTimeRange.endRange);

        // if current date then set timings from the current dat
        const st_date = parseInt(moment(startRange).tz(Constants.TIME_ZONE).format("DD"));
        const currentDate = parseInt(moment().tz(Constants.TIME_ZONE).format("DD"));

        if (currentDate === st_date) {
          const currentMinutes = moment().tz(Constants.TIME_ZONE).get("minutes") > 30 ? 30 : 0;
          startRange = moment().tz(Constants.TIME_ZONE).set('minute' , currentMinutes).tz(Constants.TIME_ZONE).format(Constants.UTC_FORMAT_TIME);
        }
        return { startRange, endRange }
      })
    } 
    else {
      setSelectedTimePicker(0)
    }
  };

  const onPlatformChanged = (platformId: string) => {
    setPlatform(platformId);
  };


  const onDateChange = (date: Moment) => {
    const startRange = moment(date).tz(Constants.TIME_ZONE).set('hour', 0).set('second', 0).set('minute', 0).format(Constants.UTC_FORMAT_TIME);
    const endRange = moment(startRange).add(1, 'days').tz(Constants.TIME_ZONE).format(Constants.UTC_FORMAT_TIME);
    const currentDate = parseInt(moment(date).tz(Constants.TIME_ZONE).format("DD"))
    console.log("CURRENT DATE", currentDate, startRange, endRange);
    setCurrentDate(currentDate);
    setScrollWidthMapper({});
    setTimes([])

    setDateTime({
      startRange: startRange,
      endRange: endRange
    });
  }

  return (
    <>
      <header>
        <div id="nav-bot" className="max-container-1445px">
          <div className="nav-bot-wrapper m-0 h-100 align-items-center">
            <AssetCategoryDesktop onCategoryChanged={assetCategoryChanged} categoryList={categories}/>
            <div className="channel-handle-wrapper p-0">
              <div className="d-flex" id="channelsDropDown">
                <AssetCategoryMobile onCategoryChanged={assetCategoryChanged} categoryList={categories}/>
                <Platforms onPlatformChanged={onPlatformChanged} platforms={platforms}/>
                <TimePicker onCurrentTimeListClicked={currentTimeListClicked} />
              </div>
            </div>
          </div>
        </div>
        <hr />
      </header>
      <DateCarousel
        onActiveDateChanged={onDateChange}
        currentDate={currentDate}
      />
      <hr className="time-slot-hr" />
      <TimeCarousel
        timePickerDateTime={selectedTimePickerDateTimeRange.startRange}
        timePickerEndDateTime={selectedTimePickerDateTimeRange.endRange}
        onTimeCarouselChanged={currentTimeListClicked}
        times={times}
        currentDate={currentDate}
        setTimes={setTimes}
      />

      <ChannelTimeSlotV2
        key={platform}
        platformId={platform}
        genre={genre}
        selectedStartDateTime={selectedTimePickerDateTimeRange.startRange}
        selectedEndDateTime={selectedTimePickerDateTimeRange.endRange}
        onActiveDatedChanged={onActiveDatedChanged}
        times={times}
        setTimes={setTimes}
        scrollWidthMapper={scrollWidthMapper}
        setCurrentDate={setCurrentDate}
        currentDate={currentDate}
        setDateTime={setDateTime}
      />

    </>
  );
}


export const getServerSideProps: GetServerSideProps = async (context) => {
  let categoryApi = new AxiosHelper(`/assetcategory`)
  const categories = await categoryApi.get();

  let platformApi = new AxiosHelper(`/platform`);
  const platforms = await platformApi.get();

  return {
    props: {
      categories: categories?.data || [],
      platforms: platforms?.data || []
    }
  }
}