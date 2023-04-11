import { faStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as fs } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Rating from "@mui/material/Rating";
import { useState } from "react";

export default function Ratings(props) {
    const [rating, setRating] = useState(0)

    const ratingChanged = (newRating) => {
        props.onRatingChanged(newRating);
        setRating(props.value)
    };

    return (
        <div>
            <Rating
                precision={0.5}
                name="simple-controlled"
                onChange={(event, newValue) => {
                    ratingChanged(newValue);
                }}
                icon={<FontAwesomeIcon style={{ color: "#faaf00" }} icon={faStar}></FontAwesomeIcon>}
                emptyIcon={<FontAwesomeIcon icon={fs}></FontAwesomeIcon>}
            />
        </div>
    );
}