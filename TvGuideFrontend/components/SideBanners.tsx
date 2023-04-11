import Image from "next/image"
import addSides from "../public/add-sides.svg";
import addSidesn from "../public/add-sidesn.svg";
import { CommonFunctions } from "../utils/common-functions";

export default function SideBanners() {
    return (<>
        <div className="position-absolute add-img start-0 left-ad-img">
            <div className="img-fluid w-100" >
                <Image src={CommonFunctions.FormatImageSrc(addSides)} alt="add-sides" layout="responsive" />
            </div>
        </div>
        <div className="position-absolute add-img end-0">
            <div className="img-fluid w-100">
                <Image src={CommonFunctions.FormatImageSrc(addSidesn)} alt="add-sides" layout="responsive" />
            </div>
        </div>
    </>)
}