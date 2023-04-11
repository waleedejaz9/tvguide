import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Rating from "@mui/material/Rating";
import { useEffect, useState } from "react";
import AxiosHelper from "../utils/helper/axios.helper";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as fs } from "@fortawesome/free-regular-svg-icons";

const ReadOnlyRating = (props) => {
    const [rating, setRating] = useState({ TotalRating: 0, AverageRating: 0 });

    const fetchRatings = async () => {
        //Fetch rating form server to display for both guest user and sign in user.
        let server = new AxiosHelper(`/rating/asset/${encodeURIComponent(props.assetTitle)}`)
        server.get().then((res: any) => {
            const finalValues = res.data
            
            setRating(value => ({
                ...value,
                ...finalValues
            }))
        }).catch((error: any) => {
            console.log(error)
        })

    }
    useEffect(() => {
        fetchRatings();
        // eslint-disable-next-line
    }, [props.assetId, props.reloadRating])

    return (
        <div className={props.ratingClassWrapper}>
            {props.stars && <h2 className={props.AverageRatingValueH2Class}><span className={props.AverageRatingValueSpanClass}>{rating.AverageRating.toFixed(1)}</span>
                <Rating precision={0.5} name="read-only" value={rating.AverageRating} readOnly icon={<FontAwesomeIcon className={props.ratingComponentClass} icon={faStar}></FontAwesomeIcon>}
                    emptyIcon={<FontAwesomeIcon icon={fs}></FontAwesomeIcon>} />
            </h2>}
            {props.votes && <h6 className={props.VotesClass}><span>{rating.TotalRating}</span> <span>votes</span></h6>}
        </div>

    )
}

export default ReadOnlyRating;