import Image from "next/image";
import StarFill from "../public/star-fill.png";
import StarEmpty from "../public/star-empty.png";
import BigBangPoster from "../public/big-bang-poster.png";
import BBCOne from "../public/bbc-one.png";
import ITV from "../public/itv.png";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { CommonFunctions } from "../../utils/common-functions";
import AxiosHelper from "../..//utils/helper/axios.helper";
import ReadOnlyRating from "../../components/ReadOnlyRating";
import Favorites from "../../components/Favorites";
import Constants from "../../utils/helper/constants";
import moment from "moment";
import Link from "next/link";
import { removeZeroMinutes } from "../../utils/helper/timeFormatter";

export default function FavoriteShow() {
  const [favoriteAssets, setFavoriteAssets] = useState([]);
  const router = useRouter();

  
  function isSeason(seasonNumber, episodeNumber) {
    return (
      <h3>
        Season {seasonNumber}, Episode {episodeNumber}
      </h3>
    );
  }

  function isShow(title) {
    return <h3>{title}</h3>;
  }

  function checkIfEntertainmentIsSeasonOrNot(
    seasonNumber,
    episodeNumber,
    title
  ) {
    if (seasonNumber) {
      return isSeason(seasonNumber, episodeNumber);
    } else {
      return isShow(title);
    }
  }

  useEffect(() => {
    const fetchFavoriteAssetDetails = async () => {
      let user = CommonFunctions.GetLoggedInUser();
      if (!user) {
        user = "";
        return;
      }
      //Fetch rating form server to display for both guest user and sign in user.
      let server = new AxiosHelper(
        `/favoriteAsset/getFavoriteShowDetails/${router.query.favoriteShow}`
      );
      server
        .get()
        .then((res: any) => {
          setFavoriteAssets(res.data);
          console.log(res.data);
        })
        .catch((error: any) => {
          console.log(error);
        });
    };
    fetchFavoriteAssetDetails();
  }, [router.query.favoriteShow]);
  return (
    <>
      {console.log("Season: ", favoriteAssets)}
      {favoriteAssets.map((item, index) => {
        return (
          <div key={index} className="fav-show-container">
            <div className="show-prog">
              <div className="fav-poster">
                {item.image &&
                  item.image !=
                    "https://for-images.s3.eu-west-2.amazonaws.com/NA-Image.jpg" && (
                    <Image
                      src={CommonFunctions.FormatImageSrc(item.image)}
                      alt="Poster"
                      height={300}
                      width={495}
                    />
                  )}
              </div>
              <div className="fav-show-details">
                <h2 className="show-name">{item.title}</h2>
                <p className="show-desc">{item.description}</p>
                <div className="show-rating-add">
                  {item.title && (
                    <ReadOnlyRating
                      assetTitle={item.title}
                      ratingClassWrapper="d-flex align-items-center TourGolf_Rating"
                      AverageRatingValueH2Class="me-3 rate-text"
                      AverageRatingValueSpanClass="rating-value"
                      ratingComponentClass="rating-stars"
                      VotesClass="text-secondary votes"
                      stars={true}
                      votes={true}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="suggestion-shows-container cursor-pointer">
              {item.assetSeasons.map((season, key) => {
                return (
                  <div key={key} className="season-episode ">
                    <Link
                      href={`/asset/${router.query.favoriteShow}/${
                        season.scheduleId
                      }/${CommonFunctions.FormatUrl(item.title)}`}
                    >
                      <div className="se-box">
                        <div className="ep-detail">
                          <div className="name-time">
                            <>
                              {checkIfEntertainmentIsSeasonOrNot(
                                season.seasonNumber,
                                season.episodeNumber,
                                item.title
                              )}
                            </>

                            <p>
                              <span>
                                {`${
                                  removeZeroMinutes(
                                    moment(season.startDate)
                                      .tz(Constants.TIME_ZONE)
                                      .format("h:mm A,")
                                  ).hours
                                }${
                                  removeZeroMinutes(
                                    moment(season.startDate)
                                      .tz(Constants.TIME_ZONE)
                                      .format("h:mm A,")
                                  ).minutes
                                }${removeZeroMinutes(
                                  moment(season.startDate)
                                    .tz(Constants.TIME_ZONE)
                                    .format("h:mm A,")
                                ).timeZone.toLowerCase()}`}
                              </span>

                              <span className="favorite-time-slot-date">
                                {moment(season.startDate)
                                  .tz("Europe/London")
                                  .format(" MMM D, YYYY")}
                                <ReadOnlyRating
                                  assetTitle={item.title}
                                  ratingClassWrapper="favorite-suggestion-rating"
                                  VotesClass="favorite-suggestion-rating-content"
                                  votes={true}
                                />
                              </span>
                            </p>
                          </div>
                          <div className="channel">
                            <Image
                              src={CommonFunctions.FormatImageSrc(season.channelLogo)}
                              alt="itv"
                              height={50}
                              width={50}
                            />
                            <p className="favourite-channel-t">{season.channelTitle}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}
