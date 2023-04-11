import Ratings from "../../../components/Rating";
import React, { useState } from "react";
import IProgramRatingRequest from "../../../view-models/program-rating-request.model";
import AxiosHelper from "../../../utils/helper/axios.helper";
import { CommonFunctions } from "../../../utils/common-functions";


export default function ReviewRatingForm(props) {
  const ratingChanged = async (rating) => {
    let user = CommonFunctions.GetLoggedInUser();
    if (!user) return
    const body: IProgramRatingRequest = {
      rating: rating,
      userId: user.id,
      assetId: props.asset[0],
      assetTitle: decodeURIComponent(props.assetTitle)
    }
    try {
      let request = new AxiosHelper('/rating/rate')
      let result = await request.post(body)
      props.onUserRatingSuccess(result)
    } catch (e: any) {
      //TODO: Error handling...
    }
  };


  return (
    <>
      <div className="rating-this-show">
        <h6 className="rating-this-show-heading">Rate This Show</h6>
        <Ratings onRatingChanged={ratingChanged} />
      </div>
    </>
  );
}