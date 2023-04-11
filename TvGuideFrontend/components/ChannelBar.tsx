import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";
import { CommonFunctions } from "./../utils/common-functions";

function ChannelBar(props) {
  return (
    <div className="row mx-0 channel-ind-slot">
      <div className="d-flex align-items-center col-9 ps-0">
        <div className="slot-img">
          <Image src={CommonFunctions.FormatImageSrc(props.imgCh)} alt="icon" width={150} height={150} />
        </div>

        <h5 className="slot-small-heading">{props.chName}</h5>
      </div>
      <div className="col-3 expand-icon">
        <Link href="">
          <a>
            <FontAwesomeIcon
              icon={props.chIcon}
              className="fa-solid fs-5 text-secondary"
              onClick={props.onClickEvent}
            ></FontAwesomeIcon>
          </a>
        </Link>
      </div>
    </div>
  );
}

export default ChannelBar;