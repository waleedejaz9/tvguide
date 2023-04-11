import Image from "next/image";
import Link from "next/link";
import dragSvg from "../public/drag.svg";
import Upward from "../public/upward-direction.png";
import {CommonFunctions} from "./../utils/common-functions";

function MyChannelBar(props) {
  return (
    <div className="row mx-0 channel-ind-slot">
      <div className="d-flex align-items-center col-9 ps-0">
        <div className="slot-img">
          <Image src={CommonFunctions.FormatImageSrc(props.imgCh)} alt="icon" width={150} height={150} />
        </div>
        <h5 className="slot-small-heading">{props.chName}</h5>
      </div>
      <div className="col-3 pl-0 expand-icon">
        <Link href="">
          <a>
            <Image className="equalSignMyChannel" src={CommonFunctions.FormatImageSrc(Upward)} alt="upward" />
          </a>
        </Link>
        <Link href="">
          <span className="delete-x" onClick={props.onClickEvent}>
            X
          </span>
        </Link>
      </div>
    </div>
  );
}

export default MyChannelBar;
