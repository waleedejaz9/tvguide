import React, { useState, useEffect, Fragment, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReviewRatingForm from "../../containers/AppForms/reviewRatingForm";
import AxiosHelper from "../../utils/helper/axios.helper";
import { CommonFunctions } from "../../utils/common-functions";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import "add-to-calendar-button/assets/css/atcb.css";
import moment from "moment";
import Link from "next/link";
import AddToCalendarButton from "../../components/AddToCalendarButton";
import ReadOnlyRating from "../../components/ReadOnlyRating";
import EdLinks from "../../utils/EdLinks.json";
import Constants from "../../utils/helper/constants";
import { removeZeroMinutes } from "../../utils/helper/timeFormatter";
import Metadata from "../../components/common/Metadata";

const {
  showThirdAd
} = require("../../public/js/channelGrid");




function Asset({ assetDetails }) {
  const router = useRouter();
  const [rating, setRating] = useState({ TotalRating: 0, AverageRating: 0 });
  const [canRate, canRateShow] = useState(true);
  const [isCalendarVisible, setCalendarVisibility] = useState(false);
  const [canAddFavoriteAsset, setFavoriteAsset] = useState(false);
  const [isUserLoggedIn, setLoginUser] = useState(false);
  const [favoriteAssets, setFavoriteAssets] = useState([]);
  const [reloadRating, setReloadRating] = useState<boolean>(false);

  const checkCurrentUserHasRated = async (assetId) => {
    let user = CommonFunctions.GetLoggedInUser();
    if (!user) {
      user = "";
      canRateShow(false);
      return;
    }
    try {
      let req = new AxiosHelper(
        `/rating/user?userId=${user.id}&assetId=${assetId}`
      );
      let res = await req.get();
      if (res.success && res.data) {
        canRateShow(false);
      }
    } catch (e: any) {
      canRateShow(true);
    }
  };

  const onShowRated = async (info) => {
    //Will hide rating control htmlFor that particular user and show ratings stars above accordingly..

    if (info.success) {
      canRateShow(false);
      setReloadRating(true);
    }
  };

  const getSummaryPriority = (summary) => {
    //sets the priority of summary for rendering. as third api is sending 3 props.
    const calendarSummary = summary?.long || summary?.medium || summary?.short;
    return calendarSummary;
  };

  const fetchProgramInfo = (assetDetails) => {
    try {
      const finalValues ={
        ...assetDetails,
        summary: getSummaryPriority(assetDetails?.summary)
      } ;
      if (dateFormatting(finalValues)) {
        setCalendarVisibility(true);
        //Handling race condition
      }
    } catch (error) {
      setCalendarVisibility(false);
      // console.log("unable to fetch program info", error);
      router.push("/error")
    }
  };

  const dateFormatting = (finalValues) => {
    // date formatting.
    // Refactoring required
    if (!finalValues.startDate || !finalValues.endDate) return false;
    finalValues.programStartTime = moment(finalValues.startDate)
      .tz(Constants.TIME_ZONE)
      .format("hh:mm A");
    finalValues.programEndTime = moment(finalValues.endDate)
      .tz(Constants.TIME_ZONE)
      .format("hh:mm A");
    finalValues.programStartDate = moment(finalValues.startDate)
      .tz(Constants.TIME_ZONE)
      .format("MMMM D, YYYY");
    finalValues.weekDayName = moment(finalValues.startDate).format("dddd");
    return true;
  };

  const addToFavoriteList = async () => {
    let user = CommonFunctions.GetLoggedInUser();
    if (!user) {
      user = "";
      canRateShow(false);
      return;
    }
    let tempFavoriteAssetList = [];
    let tempALreadyStoredDate = [];
    let req = new AxiosHelper(`/favoriteAsset/getFavorites/${user.id}`);
    let res = await req.get();
    if (res.data !== null) {
      setFavoriteAssets(res.data.favoritesAsset);
      tempALreadyStoredDate = res.data.favoritesAsset;
      let req = new AxiosHelper(
        `/favoriteAsset/updateUserFavorite?userId=${user.id}`
      );
      let favoritesAsset = [
        {
          assetId: router.query.asset[0],
          image: programDetails.image,
          title: programDetails.title,
          scheduleId: router.query.asset[1],
          programStartTime: programDetails.programStartTime,
          startDate: moment(programDetails.startDate).tz("Europe/London").format("DD MMMM YYYY")
        },
      ];
      tempFavoriteAssetList = [...favoritesAsset, ...tempALreadyStoredDate];
      let payload = {
        favoritesAsset: tempFavoriteAssetList,
      };

      await req.put(user.id, payload);
      setFavoriteAssets(tempFavoriteAssetList);
      setFavoriteAsset(true);
    } else {
      let request = new AxiosHelper(
        `/favoriteAsset/favorites?userId=${user.id}`
      );
      let obj = {
        userId: user.id,
        favoritesAsset: [
          {
            assetId: router.query.asset[0],
            image: programDetails.image,
            title: programDetails.title,
            scheduleId: router.query.asset[1],
            programStartTime: programDetails.programStartTime,
            startDate: moment(programDetails.startDate).tz("Europe/London").format("DD MMMM YYYY"),
          },
        ],
      };
      let result = (await request.post(obj)) as any;
      if (result.success) {
        setFavoriteAsset(true);
      }
    }
  };

  const checkIfUserHasAlreadyAddedFavoriteChannel = (assetId) => {
    let user = CommonFunctions.GetLoggedInUser();
    if (!user) {
      user = "";
      canRateShow(false);
      return;
    }
    let server = new AxiosHelper(
      `/favoriteAsset/checkUserFavorite?userId=${user.id}&assetId=${assetId}`
    );
    server
      .get()
      .then((res: any) => {
        setFavoriteAsset(res.data);
      })
      .catch((error: any) => {
        // console.log(error);
      });
  };
  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.asset) {
      fetchProgramInfo(assetDetails);
      checkCurrentUserHasRated(router.query.asset[0]);
      checkIfUserHasAlreadyAddedFavoriteChannel(router.query.asset[0]);
    }
    // eslint-disable-next-line
  }, [router.isReady, router.query.asset]);

  useEffect(() => {
    let user = CommonFunctions.GetLoggedInUser();
    if (user) {
      setLoginUser(true);
    }
    setTimeout(showThirdAd, 2000);
  }, []);


  const programDetails = useMemo(()=>{
    const finalValues = {
      ...assetDetails,
      summary: getSummaryPriority(assetDetails?.summary)
    };
    return finalValues;
  }, [router.query.asset])

  const seoMeta = useMemo(()=>{
    return {
      title: programDetails.title,
      image: programDetails.image,
      description: programDetails.summary,
      keywords: programDetails.category.length ? `${programDetails.channelTitle}, ${programDetails.category.map(category=>category.name).join(", ")}`  : programDetails.channelTitle
    }
  }, [programDetails])

  const formatSlug = (value) =>{
    return value ? value.toLowerCase().replace(/[^a-zA-Z ]/g, "").replace(/([^\w]+|\s+)/g, '-'): "";
  }


  return (
    <div className="container channel-details">
      <Metadata data={seoMeta}/>
      <div className="row mx-0">
        <div className="col-md-10 channel-details-wrapper">
          <div className="overlay position-relative">
            {programDetails.image &&
              programDetails.image !=
              "https://for-images.s3.eu-west-2.amazonaws.com/NA-Image.jpg" && (
                <div className="channel-main-img">
                  <Image
                    src={CommonFunctions.FormatImageSrc(programDetails.image)}
                    alt="program-details"
                    layout="fill"
                  />
                </div>
              )}
          </div>
          <div className="d-flex align-items-center justify-content-between mb-0 rating-section-wrapper">
            {programDetails.title && (
              <ReadOnlyRating
                assetTitle={programDetails.title}
                reloadRating={reloadRating}
                ratingClassWrapper="d-flex align-items-center text-nowrap"
                AverageRatingValueH2Class="me-3 rate-text"
                AverageRatingValueSpanClass="rating-value"
                ratingComponentClass="rating-stars"
                VotesClass="votes"
                stars={true}
                votes={true}
              />
            )}
            <h3 className="text-end">
              <FontAwesomeIcon
                aria-hidden="false"
                onClick={(e) => {
                  e.preventDefault();
                  if (canAddFavoriteAsset) return;
                  addToFavoriteList();
                }}
                icon={faHeart}
                className={
                  canAddFavoriteAsset && isUserLoggedIn
                    ? "fa-solid heart-icon-red-color"
                    : `fa-solid heart-icon-gray-color${!isUserLoggedIn ? " disable-favourite " : " "
                    }text-secondary likes`
                }
              ></FontAwesomeIcon>
            </h3>
          </div>
          <div className="third-ad" />
          <h1 className="main-heading">{programDetails.title}</h1>
          <h5 className="timing">
            {programDetails.programStartTime &&
              `${removeZeroMinutes(programDetails.programStartTime).hours}${removeZeroMinutes(programDetails.programStartTime).minutes
              }${removeZeroMinutes(programDetails.programStartTime).timeZone.toLowerCase()}` +
              " - " +
              `${removeZeroMinutes(programDetails.programEndTime).hours}${removeZeroMinutes(programDetails.programEndTime).minutes
              }${removeZeroMinutes(programDetails.programEndTime).timeZone.toLowerCase()}` +
              " | " +
              programDetails.weekDayName +
              ", " +
              programDetails.programStartDate}
          </h5>
          <p className="paragraph-text">{programDetails.summary}</p>
          {/* <div className="AddcalanderImageShow d-inline-block">
            <Image
              className="d-block w-full h-auto cursor-pointer"
              src={Calender}
              alt="Calender"
            />
          </div> */}
          <div className="links d-inline-flex flex-sm-row flex-column">
            {/* todo: calendar needs to be synced. */}
            {isCalendarVisible && (
              <div className="fw-normal TourGolf_AddCalender_text TourGolf_FontColor d-inline-block">
                <div className="links">
                  <AddToCalendarButton
                    name={programDetails.title}
                    description={programDetails.summary}
                    startDate={programDetails.startDate}
                    endDate={programDetails.endDate}
                    channelTitle={programDetails.channelTitle}
                  />
                </div>
              </div>
            )}
          </div>

          {EdLinks.EdLink.map((item, key) => {
            return (
              <Fragment key={key}>
                {formatSlug(item.assetTitle) == formatSlug(programDetails.title) && (
                  <Link href={`https://www.entertainmentdaily.co.uk/${item.EdLink}`}>
                    <a target="_blank" rel="noopener noreferrer" className="ed-link">
                      Read all ED!'s latest {item.assetTitle} spoilers, news and cast updates
                    </a>
                  </Link>
                )}
              </Fragment>
            );
          })}

          <div className="rating-this-show">
            {canRate && (
              <ReviewRatingForm
                asset={router.query.asset}
                onUserRatingSuccess={onShowRated}
                assetTitle={programDetails.title}
              />
            )}
          </div>
        </div>
      </div>
    </div>
    // </Layout>
  );
}

export async function getServerSideProps(context) {
  //Fetches information from server
  try {

    if (context.query.asset) {
      const assetId = context.query.asset[0]
      const scheduleId = context.query.asset[1]
      let server = new AxiosHelper(
        `/asset/getAssetDetails?assetId=${assetId}&scheduleId=${scheduleId}`);
      const data = await server
        .get()
        .then((res: any) => {
          return res.data
        })
      return { props: { assetDetails: data } }
    }
  } catch (error) {
  }
}

export default Asset