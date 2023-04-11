import ErrorImage from '../public/error.svg';
import Image from 'next/image';
import { CommonFunctions } from '../utils/common-functions';

const Error = () => {
  return (
		<div className="error_container mx-auto md:px-4 px-8 font-poppins">
			<div className="d-flex justify-content-between align-items-center py-5 error-container-content">
				<div className="md:w-5/12 lg:pr-10 text-left text-center error-content-xyz">
					<h1 className="text-90 text-left">Oops!</h1>
					<p className="detail-para text-left Gray-600">We can’t find the page you are looking for.</p>
					<p className="detail-link-para text-left Gray-400">The link you followed is either outdated, inaccurate or the server has been instructed not to let you have it</p>
					<div className="mt-5 go-home-container">
						<button className="go-to-home-btn btn-bg">Go To Home</button>
					</div>
				</div>
				<div className="md:w-6/12 md:max-w-full w-full max-w-md md:mx-0 mx-auto">
					<div className='error-img-container'>
						<Image className="sm:ml-auto mx-auto" src={CommonFunctions.FormatImageSrc(ErrorImage)} alt="Error" />
					</div>
				</div>
			</div>
		</div>
  	)
}
export default Error;