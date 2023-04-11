import React, { useEffect, useState } from "react";
import Image from "next/image";
import Fblogo from "../public/facebook.png";
import FinalUpdatedLogo from "../public/final-updated-logo.png";
import MobileFbIcon from "../public/mobileFb-icon.png";
import Link from "next/link";
import moment from "moment";
import { CommonFunctions } from "../utils/common-functions";
import SmallArrow from "../public/small-arrow.jpg";
export default function Navbar() {
  const [deviceBrowserSettings, setDeviceBrowserSettings] = useState({
    browser: "",
    OS: "",
  });
  useEffect(() => {
    const deviceOS = CommonFunctions.detectOS();
    const deviceBrowser = CommonFunctions.detectBrowser();
    setDeviceBrowserSettings({ browser: deviceBrowser, OS: deviceOS });
  }, []);
  
  return (
    <>
      <header>
        <div className="header">
          <div className="ed-container mx-auto h-100">
            <div className="d-flex justify-content-between align-items-center h-100 ed-container-mobile">
              <div className="d-flex align-items-md-center">
                <Link href="/">
                  <div className="logo d-md-block d-none">
                    <Image
                      className="w-100"
                      src={CommonFunctions.FormatImageSrc(FinalUpdatedLogo)}
                      alt="ED Logo"
                    />
                  </div>
                </Link>
                <Link href="/">
                  <div className="logo-mob d-md-none block">
                    <Image className="w-100" src={CommonFunctions.FormatImageSrc(FinalUpdatedLogo)} alt="ED Logo" />
                  </div>
                </Link>
                <div className="main-header-p">
                  <p>All the latest TV, showbiz & lifestyle </p>
                  <p>{CommonFunctions.GetDate(new Date()).format("dddd")}, {CommonFunctions.GetDate(new Date()).format("MMMM DD, YYYY")}</p>
                </div>
              </div>
              <div className="ed_container_HamBurger">
                <button
                  className="navbar-toggler border-0 dropdown"
                  id="navbarDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <span className="navbar-toggler-icon"></span>
                </button>
                <ul
                  className="dropdown-menu border-0 shadow-lg fs-md lh-base position-absolute top-0 end-0"
                  aria-labelledby="navbarDropdown"
                  style={{ inset: "auto" }}
                >
                  <li>
                    <a href="https://www.entertainmentdaily.co.uk/news/" target="_blank" rel="noreferrer">
                      <span className="header-links">News</span>
                    </a>
                  </li>
                  <li>
                    <Link className="cursor-pointer" href="/">
                      <span className="dropdown-item cursor-pointer">
                        {" "}
                        TV GUIDE{" "}
                      </span>
                    </Link>
                  </li>
                  <li>
                    <a href="https://www.entertainmentdaily.co.uk/tv/" target="_blank" rel="noreferrer">
                      <span className="dropdown-item">TV</span>

                    </a>

                    <ul className="TvSubList">
                      <li className="subList">
                        <a href="https://www.entertainmentdaily.co.uk/tv-spoilers/" target="_blank" rel="noreferrer">
                          <span className="subListLink"> TV Spoliers </span>
                        </a>
                      </li>
                      <li className="subList">
                        <a href="https://www.entertainmentdaily.co.uk/good-morning-britain/" target="_blank" rel="noreferrer">
                          <span className="subListLink">
                            {" "}
                            Good Morning Britain
                          </span>
                        </a>
                      </li>
                      <li className="subList">
                        <a href="https://www.entertainmentdaily.co.uk/loose-women/" target="_blank" rel="noreferrer">
                          <span className="subListLink"> Loose Women</span>
                        </a>
                      </li>
                      <li className="subList">
                        <a href="https://www.entertainmentdaily.co.uk/the-chase/" target="_blank" rel="noreferrer">
                          <span className="subListLink"> The Chase</span>
                        </a>
                      </li>
                      <li className="subList">
                        <a href="https://www.entertainmentdaily.co.uk/this-morning/" target="_blank" rel="noreferrer">
                          <span className="subListLink"> This Morning</span>
                        </a>
                      </li>
                      <li className="subList">
                        <a href="https://www.entertainmentdaily.co.uk/saturday-night-takeaway/" target="_blank" rel="noreferrer">
                          <span className="subListLink">
                            {" "}
                            Saturday Night Takeaway
                          </span>
                        </a>
                      </li>
                      <li className="subList">
                        <a href="https://www.entertainmentdaily.co.uk/netflix/" target="_blank" rel="noreferrer">
                          <span className="subListLink"> Netflix</span>
                        </a>
                      </li>
                      <li className="subList">
                        <a href="https://www.entertainmentdaily.co.uk/strictly-come-dancing/" target="_blank" rel="noreferrer">
                          <span className="subListLink">
                            {" "}
                            Strictly Come Dancing
                          </span>
                        </a>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <a href="https://www.entertainmentdaily.co.uk/soaps/" target="_blank" rel="noreferrer">
                      <span className="dropdown-item">SOAPS</span>
                    </a>
                    <ul className="TvSubList">
                      <li className="subList">
                        <a href="https://www.entertainmentdaily.co.uk/coronation-street/" target="_blank" rel="noreferrer">
                          <span className="subListLink">
                            Coronation Street
                          </span>
                        </a>
                      </li>
                      <li className="subList">
                        <a href="https://www.entertainmentdaily.co.uk/eastenders/" target="_blank" rel="noreferrer">
                          <span className="subListLink"> Eastenders</span>
                        </a>
                      </li>
                      <li className="subList">
                        <a href="https://www.entertainmentdaily.co.uk/emmerdale/" target="_blank" rel="noreferrer">
                          <span className="subListLink"> Emmerdale</span>
                        </a>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <a
                      className="dropdown-item"
                      href="https://www.entertainmentdaily.co.uk/royals/" target="_blank" rel="noreferrer"
                    >
                      <span className="dropdown-item">ROYALS</span>
                    </a>
                  </li>
                  <li>
                    <a
                      className="dropdown-item"
                      href="https://www.entertainmentdaily.co.uk/true-crime/" target="_blank" rel="noreferrer"
                    >
                      <span className="dropdown-item">TRUE CRIME</span>
                    </a>
                  </li>
                  {/* <li>
                    <a className="dropdown-item" href="#">
                      <span className="dropdown-item">LOTTERY</span>
                    </a>
                  </li> */}
                  <li>
                    <a
                      className="dropdown-item"
                      href="https://www.entertainmentdaily.co.uk/lifestyle/" target="_blank" rel="noreferrer"
                    >
                      <span className="dropdown-item">LIFESTYLE</span>
                    </a>
                  </li>
                  <li>
                    <a href="https://www.entertainmentdaily.co.uk/trending/" target="_blank" rel="noreferrer">
                      <span className="dropdown-item">TRENDING</span>
                    </a>
                    <ul className="TvSubList">
                      <li className="subList">
                        <a href="https://www.entertainmentdaily.co.uk/strictly-come-dancing/" target="_blank" rel="noreferrer">
                          <span className="subListLink">
                            Strictly Come Dancing
                          </span>
                        </a>
                      </li>
                      <li className="subList">
                        <a href="https://www.entertainmentdaily.co.uk/married-at-first-sight-uk/" target="_blank" rel="noreferrer">
                          <span className="subListLink">
                            {" "}
                            Married at First Sight UK
                          </span>
                        </a>
                      </li>
                      <li className="subList">
                        <a href="https://www.entertainmentdaily.co.uk/made-in-chelsea/" target="_blank" rel="noreferrer">
                          <span className="subListLink">
                            {" "}
                            Made in Chelsea
                          </span>
                        </a>
                      </li>
                      <li className="subList">
                        <a href="https://www.entertainmentdaily.co.uk/im-a-celebrity/" target="_blank" rel="noreferrer">
                          <span className="subListLink">
                            I'm A Celebrity...
                          </span>
                        </a>
                      </li>
                    </ul>
                  </li>

                  <li className="dropdown-item-fb-logo">
                    <a
                      className="dropdown-item"
                      target="_blank"
                      rel="noreferrer"
                      href="https://www.facebook.com/entertainmentdailyfix/"
                    >
                      <Image
                        className="w-100 h-100"
                        src={CommonFunctions.FormatImageSrc(MobileFbIcon)}
                        alt="FaceBook"
                      />
                    </a>
                  </li>
                </ul>
              </div>
              <a
                className="fb-logo d-block cursor-pointer"
                target="_blank"
                rel="noreferrer"
                href="https://www.facebook.com/entertainmentdailyfix/"
              >
                <Image className="w-100 h-100" src={CommonFunctions.FormatImageSrc(Fblogo)} alt="FaceBook" />
              </a>
            </div>
          </div>
        </div>
        <div className="menu-btns d-md-block d-none">
          <div className="ed-container d-flex align-items-center mx-auto">
            <a href="https://www.entertainmentdaily.co.uk/news/" target="_blank" rel="noreferrer">
              <span className="header-links">News</span>
            </a>
            <Link href="/">
              <span className="header-links">TV GUIDE</span>
            </Link>
            <div className="dropdown header-links" id="DropDownLinks">
              <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton1">
                <a href="https://www.entertainmentdaily.co.uk/tv/" target="_blank" rel="noreferrer">
                  <span>TV</span>
                  <span className={`dropdown-arrow-s 
                  ${deviceBrowserSettings.OS === "Mac" 
                  ? deviceBrowserSettings.browser === "safari" 
                  ? "mac-safari" : deviceBrowserSettings.browser === "chrome" 
                  ? "mac-chrome" : deviceBrowserSettings.browser === "firefox" 
                  ? "mac-firefox" : "" 
                  : deviceBrowserSettings.OS === "Linux" 
                  ? deviceBrowserSettings.browser === "firefox" 
                  ? "linux-firefox" : "" 
                  : ""  }`}>
                    ▼{" "}
                  </span>
                </a>
              </button>
              <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                <li>
                  <a href="https://www.entertainmentdaily.co.uk/tv-spoilers/" target="_blank" rel="noreferrer">
                    <span className="dropdown-item">TV Spoilers</span>
                  </a>
                </li>
                <li>
                  <a href="https://www.entertainmentdaily.co.uk/good-morning-britain/" target="_blank" rel="noreferrer">
                    <span className="dropdown-item">
                      {" "}
                      Good Morning Britain{" "}
                    </span>
                  </a>
                </li>
                <li>
                  <a href="https://www.entertainmentdaily.co.uk/loose-women/" target="_blank" rel="noreferrer">
                    <span className="dropdown-item"> Loose Women </span>
                  </a>
                </li>
                <li>
                  <a href="https://www.entertainmentdaily.co.uk/the-chase/" target="_blank" rel="noreferrer">
                    <span className="dropdown-item">The Chase </span>
                  </a>
                </li>
                <li>
                  <a href="https://www.entertainmentdaily.co.uk/this-morning/" target="_blank" rel="noreferrer">
                    <span className="dropdown-item">This Morning</span>
                  </a>
                </li>
                <li>
                  <a href="https://www.entertainmentdaily.co.uk/saturday-night-takeaway/" target="_blank" rel="noreferrer">
                    <span className="dropdown-item">
                      Saturday Night Takeway
                    </span>
                  </a>
                </li>
                <li>
                  <a href="https://www.entertainmentdaily.co.uk/netflix/" target="_blank" rel="noreferrer">
                    <span className="dropdown-item">Netflix</span>
                  </a>
                </li>
                <li>
                  <a href="https://www.entertainmentdaily.co.uk/strictly-come-dancing/" target="_blank" rel="noreferrer">
                    <span className="dropdown-item">
                      Strictly Come Dancing
                    </span>
                  </a>
                </li>
              </ul>
            </div>
            <div className="dropdown header-links" id="DropDownLinks">
              <button
                className="btn btn-secondary dropdown-toggle"
                type="button"
              >
                <a href="https://www.entertainmentdaily.co.uk/soaps/" target="_blank" rel="noreferrer">
                  <span>SOAPS</span>
                  <span className={`dropdown-arrow-s 
                  ${deviceBrowserSettings.OS === "Mac" 
                  ? deviceBrowserSettings.browser === "safari" 
                  ? "mac-safari" : deviceBrowserSettings.browser === "chrome" 
                  ? "mac-chrome" : deviceBrowserSettings.browser === "firefox" 
                  ? "mac-firefox" : "" 
                  : deviceBrowserSettings.OS === "Linux" 
                  ? deviceBrowserSettings.browser === "firefox" 
                  ? "linux-firefox" : "" 
                  : ""  }`}>
                    ▼{" "}
                  </span>
                </a>
              </button>
              <ul
                className="dropdown-menu"
                aria-labelledby="dropdownMenuButton1"
              >
                <li>
                  <a href="https://www.entertainmentdaily.co.uk/coronation-street/" target="_blank" rel="noreferrer">
                    <span className="dropdown-item"> Coronation Street </span>
                  </a>
                </li>
                <li>
                  <a href="https://www.entertainmentdaily.co.uk/eastenders/" target="_blank" rel="noreferrer">
                    <span className="dropdown-item"> EastEnders </span>
                  </a>
                </li>
                <li>
                  <a href="https://www.entertainmentdaily.co.uk/emmerdale/" target="_blank" rel="noreferrer">
                    <span className="dropdown-item">emmerdale</span>
                  </a>
                </li>
              </ul>
            </div>
            <a href="https://www.entertainmentdaily.co.uk/royals/" target="_blank" rel="noreferrer">
              <span className="header-links">Royals</span>
            </a>
            <a href="https://www.entertainmentdaily.co.uk/true-crime/" target="_blank" rel="noreferrer">
              <span className="header-links">True Crime</span>
            </a>
            {/* <a href="#">
              <span className="header-links">Lottery</span>
            </a> */}
            <a href="https://www.entertainmentdaily.co.uk/lifestyle/" target="_blank" rel="noreferrer">
              <span className="header-links">Lifestyle</span>
            </a>
            <div className="dropdown header-links" id="DropDownLinks">
              <button
                className="btn btn-secondary dropdown-toggle"
                type="button"
              >
                <a href="https://www.entertainmentdaily.co.uk/trending/" target="_blank" rel="noreferrer">
                  <span>TRENDING</span>
                  <span className={`dropdown-arrow-s 
                  ${deviceBrowserSettings.OS === "Mac" 
                  ? deviceBrowserSettings.browser === "safari" 
                  ? "mac-safari" : deviceBrowserSettings.browser === "chrome" 
                  ? "mac-chrome" : deviceBrowserSettings.browser === "firefox" 
                  ? "mac-firefox" : "" 
                  : deviceBrowserSettings.OS === "Linux" 
                  ? deviceBrowserSettings.browser === "firefox" 
                  ? "linux-firefox" : "" 
                  : ""  }`}>
                    ▼{" "}
                  </span>
                </a>
              </button>
              <ul
                className="dropdown-menu"
                aria-labelledby="dropdownMenuButton1"
              >
                <li>
                  <a href="https://www.entertainmentdaily.co.uk/strictly-come-dancing/" target="_blank" rel="noreferrer">
                    <span className="dropdown-item">
                      Strictly Come Dancing
                    </span>
                  </a>
                </li>
                <li>
                  <a href="https://www.entertainmentdaily.co.uk/married-at-first-sight-uk/" target="_blank" rel="noreferrer">
                    <span className="dropdown-item">
                      Married at First Sight UK
                    </span>
                  </a>
                </li>
                <li>
                  <a href="https://www.entertainmentdaily.co.uk/made-in-chelsea/" target="_blank" rel="noreferrer">
                    <span className="dropdown-item">Made in Chelsea</span>
                  </a>
                </li>
                <li>
                  <a href="https://www.entertainmentdaily.co.uk/im-a-celebrity/" target="_blank" rel="noreferrer">
                    <span className="dropdown-item">I'm A Celebrity...</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
