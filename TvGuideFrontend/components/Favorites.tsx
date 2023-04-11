import Link from "next/link";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import AxiosHelper from "../utils/helper/axios.helper";
import { CommonFunctions } from "../utils/common-functions";
import { useRouter } from "next/router";
import NoImg from "../public/no-img.jpg";
import { removeZeroMinutes } from "../utils/helper/timeFormatter";
import moment from 'moment';

export default function Favorites() {
  const [favoriteAssets, setFavoriteAssets] = useState([]);
  const router = useRouter();

  const fetchFavoriteAssetDetails = async () => {
    let user = CommonFunctions.GetLoggedInUser();
    if (!user) {
      user = "";
      return;
    }
    //Fetch rating form server to display for both guest user and sign in user.
    let server = new AxiosHelper(`/favoriteAsset/getFavorites/${user.id}`);
    server
      .get()
      .then((res: any) => {
        setFavoriteAssets(res.data.favoritesAsset);
      })
      .catch((error: any) => {
        console.log(error);
      });
  };

  const deleteFavoriteAsset = async (item) => {
    let user = CommonFunctions.GetLoggedInUser();
    if (!user) {
      user = "";
      return;
    }
    const updatedChannelsArray = favoriteAssets.filter(
      (favoriteChannel) =>
        favoriteAssets.indexOf(favoriteChannel) != favoriteAssets.indexOf(item)
    );


    try {
      let req = new AxiosHelper(`/favoriteAsset?userId=${user.id}`);
      let payload = {
        favoritesAsset: [item],
      };
      let res = await req.delete(user.id, payload);
      if (res) {
        setFavoriteAssets(updatedChannelsArray);
      }
    } catch (e: any) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (!router.isReady) return;
    fetchFavoriteAssetDetails();
  }, [router.isReady]);

  return (
    <>
      <div className="container py-lg-5 py-3 favourites px-md-4 px-2">
        <h1 className="MyFavHeading">My Favorites</h1>
        <div className="row mx-0">
          <>
            {" "}
            {favoriteAssets.map((item, key) => {
              return (
                <div
                  className="col-lg-3 col-md-4 col-6 cursor-pointer position-relative"
                  key={key}
                >
                  <div className="overlay favourite-overlay pt-md-3 pt-2 pb-5 position-absolute top-0 start-0 rounded-top">
                    <FontAwesomeIcon
                      onClick={(e) => {
                        deleteFavoriteAsset(item);
                      }}
                      icon={faTrash}
                      className={
                        item.image !=
                        "https://for-images.s3.eu-west-2.amazonaws.com/NA-Image.jpg"
                          ? "cursor-pointer text-white delete-icon float-end pe-md-3 pe-2 fs-6"
                          : "cursor-pointer trash-gray-color delete-icon float-end pe-md-3 pe-2 fs-6"
                      }
                    ></FontAwesomeIcon>
                  </div>
                  <Link href={`/favoriteShow/${item.assetId}`}>
                    <div className="mb-4 position-relative favorite-show">
                      {item.image && (
                        <div
                          className="mb-2 CardImagebg"
                          style={
                            item.image !=
                            "https://for-images.s3.eu-west-2.amazonaws.com/NA-Image.jpg"
                              ? { backgroundImage: `url(${item.image})` }
                              : { backgroundImage: `url("/no-img.jpg")` }
                          }
                        ></div>
                      )}

                      <div className="d-flex justify-content-between">
                        <h6 className=" myFavShowName mb-0">{item.title} </h6>
                      </div>
                      <p className="myFavShowDate">
                        {moment(item.startDate).format('MMMM D, YYYY') +
                          ", " +
                          `${removeZeroMinutes(item.programStartTime).hours}${
                            removeZeroMinutes(item.programStartTime).minutes
                          }${
                            removeZeroMinutes(item.programStartTime).timeZone.toLocaleLowerCase()
                          }`}
                      </p>
                    </div>
                  </Link>
                </div>
              );
            })}
          </>
        </div>
      </div>
    </>
  );
}
