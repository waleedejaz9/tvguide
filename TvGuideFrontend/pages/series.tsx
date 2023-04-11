import Layout from "../components/Layouts";
import Series from "../components/Series";
import { useRouter } from "next/router";
import React, { useEffect, useReducer, useState,Fragment } from "react";
import AxiosHelper from "../utils/helper/axios.helper";
import InfiniteScroll from "react-infinite-scroll-component";
import moment from "moment";
import Constants from "../utils/helper/constants";

export default function SeriesPage() {
  const defaultState = {
    searchList: [],
    lastStartDateTime: moment()
      .tz(Constants.TIME_ZONE)
      .format(Constants.UTC_FORMAT_TIME),
  };

  // Reducer Function
  const reducer = (state, action) => {
    if (action.type === "SET_DATA") {
      return { ...state, searchList: state.searchList.concat(action.payload) };
    } else if (action.type === "RESET") {
      return { ...state, ...action.payload };
    } else if (action.type === "UPDATE_START_DATE") {
      return { ...state, lastStartDateTime: action.payload };
    }
    return state;
  };

  const [searchList, setSearchList] = useState([]);
  const [state, dispatch] = useReducer(reducer, defaultState);
  const router = useRouter();

  //Search functionality axios call on shows title from page query
  const fetchSchedules = (title) => {
    let server = new AxiosHelper(
      `schedule/${decodeURIComponent(title)}/${state.lastStartDateTime}`
    );
    server
      .get()
      .then((res: any) => {
        dispatch({ type: "SET_DATA", payload: res.data });
        if (res.data?.length > 0) {
          dispatch({
            type: "UPDATE_START_DATE",
            payload: res.data[res.data.length - 1].startDate,
          });
        }
      })
      .catch((error: any) => {
        console.log(error);
      });
  };

  useEffect(() => {
    if (!router.isReady || !router.query.title) return;
    dispatch({ type: "RESET", payload: defaultState });
    // eslint-disable-next-line
  }, [router.isReady, router.query.title]);

  useEffect(() => {
    if (!router.isReady || !router.query.title) return;
    fetchSchedules(router.query.title);
    // eslint-disable-next-line
  }, [state.lastStartDateTime]);

  return (
    // <Layout>
      <div className="container series">
        <div className="d-flex py-3">
          <div className="row mx-0 py-3 w-100 series-shows-listing-wrapper">
            {state.searchList &&
              state.searchList.map((item, i) => (
                <Fragment key={i}>
                  <Series
                    key={item.scheduleId}
                    assetId={item.assetId}
                    scheduleId={item.scheduleId}
                    assetName={item.title}
                    assetDuration={item.duration}
                    assetStartDate={item.startDate}
                    assetImagePath={item.image}
                    assetChannelLogo={item.channelLogo}
                  />
                </Fragment>
              ))}
          </div>
        </div>
      </div>
    // </Layout>
  );
}
