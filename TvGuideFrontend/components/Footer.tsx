import FooterLogo from '../public/ed_footer_logo.png';
import SearchIconWhite from '../public/icon-search-white.svg';
import Image from 'next/image';
import Link from 'next/link';
import Facebook from '../public/facebook.png';
import NewWhiteLogo from '../public/tvguide-removebg-preview.png';
import { CommonFunctions } from '../utils/common-functions';

export default function Navbar() {
    return (
        <>
            <div className="footer-container">
                <div className="container">
                    <div className='footer-top-content'>
                        <div className='logo'>
                            <div className="footer-logo-xyz">
                                <Image src={CommonFunctions.FormatImageSrc(NewWhiteLogo)} alt="logo" width="120" height="75" />
                            </div>
                        </div>
                        <div className='footer-form-container'>
                            <form action="https://www.entertainmentdaily.co.uk/">
                                <input type="text" placeholder="Search Entertainment Daily" />
                                <button className=''><Image src={CommonFunctions.FormatImageSrc(SearchIconWhite)} alt="search" width="23" height="23" /></button>
                            </form>
                        </div>
                    </div>

                    <div className='footer-middle-content'>
                        <ul className='footer-links-container'>
                            <li className="footer-link-item">
                                <Link href="https://www.entertainmentdaily.co.uk/news/">NEWS</Link>
                            </li>
                            <li className="footer-link-item">
                                <Link href="https://www.entertainmentdaily.co.uk/news/">TV</Link>
                                <ul className='footer-sub-menu-items'>
                                    <li>
                                        <Link href="https://www.entertainmentdaily.co.uk/tv-spoilers/">TV Spoilers</Link>
                                    </li>
                                    <li>
                                        <Link href="https://www.entertainmentdaily.co.uk/good-morning-britain/">Good Morning Britain</Link>
                                    </li>
                                    <li>
                                        <Link href="https://www.entertainmentdaily.co.uk/loose-women/">Loose Women</Link>
                                    </li>
                                    <li>
                                        <Link href="https://www.entertainmentdaily.co.uk/the-chase/">The Chase</Link>
                                    </li>
                                    <li>
                                        <Link href="https://www.entertainmentdaily.co.uk/this-morning/">This Morning</Link>
                                    </li>
                                    <li>
                                        <Link href="https://www.entertainmentdaily.co.uk/saturday-night-takeaway/">Saturday Night Takeaway</Link>
                                    </li>
                                    <li>
                                        <Link href="https://www.entertainmentdaily.co.uk/netflix/">Netflix</Link>
                                    </li>
                                </ul>
                            </li>
                            <li className="footer-link-item">
                                <Link href="https://www.entertainmentdaily.co.uk/soaps/">SOAPS</Link>
                                <ul className='footer-sub-menu-items'>
                                    <li>
                                        <Link href="https://www.entertainmentdaily.co.uk/eastenders/">EastEnders</Link>
                                    </li>
                                    <li>
                                        <Link href="https://www.entertainmentdaily.co.uk/coronation-street/">Coronation Street</Link>
                                    </li>
                                    <li>
                                        <Link href="https://www.entertainmentdaily.co.uk/emmerdale/">Emmerdale</Link>
                                    </li>
                                </ul>
                            </li>
                            <li className="footer-link-item">
                                <Link href="https://www.entertainmentdaily.co.uk/royals/">ROYALS</Link>
                            </li>
                            <li className="footer-link-item">
                                <Link href="https://www.entertainmentdaily.co.uk/true-crime/">TRUE CRIME</Link>
                            </li>
                        </ul>
                    </div>

                    <div className='footer-facebook-connect'>
                        <div className="">
                            <Image src={CommonFunctions.FormatImageSrc(Facebook)} alt="facebook" width="32" height="32" />
                        </div>
                        <p>CONNECT WITH US</p>
                    </div>

                    <div className='footer-main-links'>
                        <div className='footer-main-item'>
                            <div>
                                <Link href="https://www.entertainmentdaily.co.uk/about/">About Us </Link>
                            </div>
                            <ul>
                                <li>
                                    <Link href="https://www.entertainmentdaily.co.uk/news/meet-the-entertainment-daily-team/">Meet The Team</Link>
                                </li>
                                <li>
                                    <Link href="https://www.entertainmentdaily.co.uk/news/entertainment-daily-editorial-policies/">Editorial Policies</Link>
                                </li>
                                <li>
                                    <Link href="https://advertise.entertainmentdaily.co.uk/">Advertise</Link>
                                </li>
                                <li>
                                    <Link href="mailto:hello@entertainmentdaily.co.uk">Contact Us</Link>
                                </li>
                            </ul>
                        </div>

                        <div className='footer-main-item item1'>
                            <div>
                                <Link href="https://www.entertainmentdaily.co.uk/cookies/">Cookies Policy</Link>
                            </div>
                        </div>

                        <div className='footer-main-item'>
                            <div>
                                <Link href="#">Consent Settings</Link>
                            </div>
                        </div>

                        <div className='footer-main-item'>
                            <div>
                                <Link href="https://www.entertainmentdaily.co.uk/privacy/">Privacy</Link>
                            </div>
                        </div>
                    </div>

                    <div className='footer-bottom-content'>
                        <p>© 2022 <Link href="/" >www.entertainmentdaily.co.uk</Link>. All rights reserved.</p>
                        <p>Operated by Digitalbox Publishing Ltd.</p>
                        <p>Digitalbox Publishing Ltd. Co Reg No. 09909897</p>
                    </div>
                </div>
            </div>
        </>
    )
}







