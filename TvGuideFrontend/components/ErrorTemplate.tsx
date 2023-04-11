import Image from "next/image";
import Link from "next/link";
import errorImg from "../public/404.svg";
import {CommonFunctions} from "./../utils/common-functions";

const ErrorTemplate = () => {
    return (
        <>
            <div className="container">
                <div className="row mx-0">
                    <div className="col-md-6 align-self-center text order-md-1 order-2">
                        <div className="p-3">
                            <h1 className="fw-bold fs-er mb-3">Oops!</h1>
                            <h4 className="error-text mb-3 fw-bold">{`We can’t find the page you are looking for.`}</h4>
                            <p className="text-secondary mb-3">The link you followed is either outdated, inaccurate or the server has been instructed not to let you have it</p>
                            <Link href="/"><button className="btn rounded-pill btn-primary fs-sm fw-bold py-2 px-4">Go to Home</button></Link>
                        </div>
                    </div>
                    <div className="col-md-6 order-md-2 order-1">
                        <Image src={CommonFunctions.FormatImageSrc(errorImg)} layout="responsive" alt="error404" />
                    </div>
                </div>
            </div>
        </>
    )
}

export default ErrorTemplate;