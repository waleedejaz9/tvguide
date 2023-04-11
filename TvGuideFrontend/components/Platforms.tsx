import React, { useState, useEffect } from "react";
import Link from 'next/link'
import AxiosHelper from "../utils/helper/axios.helper";
import Constants from "../utils/helper/constants";
import { CommonFunctions } from "../utils/common-functions";

export default function Platforms(props) {
  const [activePlatform, setPlatform] = useState("");
  const [platforms, setPlatformList] = useState([]);

  useEffect(() => {
    const user = CommonFunctions.GetLoggedInUser();
    if (!user) {
      // Excluding 'My Channel' from the platform List
      setPlatformList(props?.platforms?.length ? props.platforms.filter((r) => r.platformId !== "c101") : []);
      if (props.platforms?.length) {
        const popular = props.platforms.find(
          (p) => p.platformName === Constants.POPULAR_PLATFORM_TITLE
        );
        if (popular) {
          checkedIsActive(popular);
        } else {
          checkedIsActive(props.platforms[0]);
        }
      }
    } 
    else {
      setPlatformList(props.platforms);
      if (props.platforms?.length) {
        const myChannel = props.platforms.find(
          (p) => p.platformName === Constants.POPULAR_PLATFORM_TITLE
        );
        if (myChannel) {
          checkedIsActive(myChannel);
        } else {
          checkedIsActive(props.platforms[0]);
        }
      }
    }
    // eslint-disable-next-line
  }, []);

  const checkedIsActive = (i) => {
    setPlatform(i.platformName);
    props.onPlatformChanged(i.platformId);
  };

  return (
    <>
      <div className="nav-item dropdown">
        <Link href="/" shallow scroll={false}>
          <a
            className="nav-link dropdown-toggle fs-md"
            id="currentPlatforms"
            role="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            {activePlatform}
          </a>
        </Link>
        <ul
          className="dropdown-menu border-0 shadow-sm fs-md"
          aria-labelledby="platformNavbarDropdownContainer"
        >
          {platforms.map((p, i) => (
            <li key={`platform${i}`}>
              <a
                className="dropdown-item"
                key={i}
                onClick={() => checkedIsActive(p)}
              >
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    id={`platform${i}`}
                    name={`platform${i}`}
                    checked={activePlatform === p.platformName}
                    onChange={() => checkedIsActive(p)}
                  />
                  <label
                    className="form-check-label cursor-pointer"
                    htmlFor={`platform${i}`}
                    id={p.platformName}
                  >
                    {p.platformName}
                  </label>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
