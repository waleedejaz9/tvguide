import Image from "next/image"
import banner from "../public/banner.svg";
import mobile from "../public/mobile-banner.svg";
import { CommonFunctions } from "../utils/common-functions";

export default function Hero() {
    return (
        <>
            <div className="text-center">
                <div className="img-fluid d-sm-block d-none w-100">
                    <Image src={CommonFunctions.FormatImageSrc(banner)} alt="banner"  layout="responsive"/>
                </div>
                <div className="img-fluid d-sm-none d-block w-100">
                    <Image src={CommonFunctions.FormatImageSrc(mobile)} alt="banner" layout="responsive"/>
                </div>
            </div>

        </>
    )
}