import React, { createRef, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CommonFunctions } from "../utils/common-functions";
import AxiosHelper from "../utils/helper/axios.helper";
import Login from "./Login";
import Signup from "./Signup";
import Image from "next/image";
import iconSearch from "../public/icon-search.svg";
import UserImage from "../public/MyAccount-icon.png";
import { useRouter } from "next/router";
import debounce from "lodash.debounce";
import useKeyPress from "../hooks/useKeyPress";

// TODO: This must be define in a separate .json file.
const allowedBackToHomeRoutes = ["/customChannel", "/favorites", "/asset", "/series", "/channel", "/favoriteShow"];
const allowedlogoutToHomeRoutes = ["/customChannel", "/favorites"];
const allowedassistToHomeRoutes = ["/asset"];
const disabledSearchbarRoutes = ["/customChannel", "/favorites"];
export default function SearchBarNav() {
  const router = useRouter();
  const [isUserLoggedIn, setLoginUser] = useState(false);
  const [showModal, setLoginPopup] = useState(false);
  const [isModelOpen, setShowSignUpPopup] = useState(false);
  const [isEnter, setisEnter] = useState(false);
  const [search, setSearch] = useState('');

  const searchBox = useRef<HTMLInputElement>();
  const searchDropDownRef = useRef<HTMLInputElement>();
  const downPress = useKeyPress("ArrowDown", searchBox);
  const upPress = useKeyPress("ArrowUp", searchBox);
  const enterPress = useKeyPress("Enter", searchBox);
  const [cursor, setCursor] = useState<number>(0);

  const existBackToHome = allowedBackToHomeRoutes.some((substring) =>
    router.pathname.includes(substring)
  );
  const existlogoutToHome = allowedlogoutToHomeRoutes.some((substring) =>
    router.pathname.includes(substring)
  );
  const existassistToHome = allowedassistToHomeRoutes.some((substring) =>
    router.pathname.includes(substring)
  );
  //search functionality variables
  const [searchList, setSearchList] = useState([]);
  const [searchedText, setSearchText] = useState("");

  const onChangeSearch = (event) => {
    const { value } = event.target;
    setSearch(value);
    debouncedChangeHandler(event);
  }

  const fetchSuggestions = (event) => {
    // alert("yes");
    if (event.target.value.length) {
      let server = new AxiosHelper(`schedule/suggest/${encodeURIComponent(event.target.value)}`);
      server
        .get()
        .then((res: any) => {
          setSearchList(res.data);
          setCursor(-1);
        })
        .catch((error: any) => {
          console.log(error);
        });
    } else {
      setSearchList([]);
    }
  };
  const enterkey = "false";
  const debouncedChangeHandler = useMemo(
    () => debounce(fetchSuggestions, 300),
    // eslint-disable-next-line
    []
  );

  // Stop the invocation of the debounced function
  // after unmounting
  useEffect(() => {
    return () => {
      debouncedChangeHandler.cancel();
    };
    // eslint-disable-next-line
  }, []);

  //Sigin up Form
  const handleCloseSignupPopup = async () => {
    setShowSignUpPopup(false);
  };
  //Sigin up Form
  const handleSignupFormOpening = () => {
    setLoginPopup(false);
    setShowSignUpPopup(true);
  };

  //Login Popup Form
  const handleClose = () => setLoginPopup(false);

  //Login Popup Form
  const onLoginClick = () => {
    setLoginPopup(true);
  };
  //Login popup Form
  const onFormSubmit = async (event) => {
    event.preventDefault();
    ///TODO Ahmed: Fix this eve.ttarget.email with proper state
    try {
      let request = new AxiosHelper(
        `/user/validate?email=${event.target.email.value}`
      );
      let result = await request.get();
      if (result.success && result.data) {
        CommonFunctions.SetUser(result.data);
        location.reload();
      }
    } catch (e) {
      alert("You are not authorized");
    }
  };

  const onLogout = () => {
    CommonFunctions.LogoutUser();
    setLoginUser(false);
    if (existlogoutToHome) {
      router.push("/");
    } else {
      location.reload();
    }
  };

  const checkIsUserLoggedIn = () => {
    return new Promise((resolve, reject) => {
      let user = CommonFunctions.GetLoggedInUser();
      if (user) {
        setLoginUser(true);
        resolve(true);
      } else {
        setLoginUser(false);
        reject("User is not logged-in so it cannt rate this program now");
      }
    });
  };

  //Suggestion handler and navigate to series page
  const onSuggestionClick = (text) => {
    const transformText = text.replace(/[0-9./]/g, "");
    setSearch(text)
    // alert("heee thae ");
    setSearchList([]);
    router.push(`/series?title=${encodeURIComponent(transformText)}`);
  };

  useEffect(() => {
    checkIsUserLoggedIn();
  }, []);

  useEffect(() => {
    if (searchList.length && downPress) {
      setCursor((prevState) =>
        prevState < searchList.length - 1 ? prevState + 1 : prevState
      );
      cursor > 2 &&
        searchDropDownRef?.current?.scroll({
          top: searchDropDownRef?.current?.offsetTop + cursor * 35,
          behavior: "smooth",
        });
    }
    // eslint-disable-next-line
  }, [downPress]);

  useEffect(() => {
    if (searchList.length && upPress) {
      setCursor((prevState) => (prevState > 0 ? prevState - 1 : prevState));
      searchDropDownRef?.current?.scroll({
        top: searchDropDownRef?.current?.offsetTop + (cursor - 2) * 35,
        behavior: "smooth",
      });
    }
    // eslint-disable-next-line
  }, [upPress]);

  useEffect(() => {
    if (searchList.length && enterPress) {
      if (cursor > -1)
        onSuggestionClick(searchList[cursor]);
      else {
        onSuggestionClick(search);
      }
    }
    // eslint-disable-next-line
  }, [cursor, enterPress]);

  useEffect(() => {
    // setting the searched value into the search textbox
    if (router.query.title) {
      // searchBox.current.value = decodeURIComponent(
      //   router.query.title as string
      // );
    } else {
      searchBox.current.value = "";
      setSearch("")
    }

  }, [router.query.title]);

  return (
    <>
      {existBackToHome && (
        <div className="back-to-home-button pb-0 pt-4">
          <div className="container">
            <div className="d-flex align-items-center">
              <Link href="/">
                <button
                  className="btn d-flex align-items-center learn-more"
                  type="button"
                  id="back-to-home-btn"
                >
                  <span
                    className="btn-primary BackBtnIcon circle"
                    aria-hidden="true"
                  >
                    <span className="icon arrow"></span>
                  </span>
                  <h3 className="mx-3 mt-2 BackHomeText button-text">
                    Back To Home
                  </h3>
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
      <header>
        <nav className="navbar navbar-light px-3">
          <div className="container">
            <form
              autoComplete="off"
              className="d-flex position-relative"
              id="search-form"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="input-group">
                <span className="input-group-text border-0" id="basic-addon1">
                  <Image
                    width={20}
                    height={20}
                    alt="search-icon"
                    src={CommonFunctions.FormatImageSrc(iconSearch)}
                  />
                </span>
                <input
                  value={search}
                  type="text"
                  ref={searchBox}
                  className="form-control border-0 fs-md ps-md-1 ps-0"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      // alert("working");
                      setisEnter(true)
                    }
                  }}
                  onChange={(e) => {
                    onChangeSearch(e)
                  }}
                  id="SearchTvShow"
                  placeholder="Search TV Show"
                  aria-label="Username"
                  aria-describedby="basic-addon1"
                  autoComplete="off"

                />
                <div
                  id="suggestionList"
                  className={
                    searchList.length > 0
                      ? "searchable-filter-dropdown show"
                      : "searchable-filter-dropdown"
                  }
                  ref={searchDropDownRef}
                >
                  <ul>
                    {searchList &&
                      searchList.map((suggestion, i) => (
                        <li
                          key={i}
                          onClick={() => onSuggestionClick(suggestion)}
                          className={i === cursor ? "list-keydown" : ""}
                        >
                          {suggestion}
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </form>

            <div className="collapse navbar-collapse my-account-dropdown">
              <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center lh-1 pt-1">
                <li className="myAccount">
                  <div className="dropdown" id="account-dropdown">
                    {isUserLoggedIn ? (
                      <>
                        <button
                          className="btn dropdown-toggle"
                          type="button"
                          id="dropdownMenuButton2"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          <Image
                            width={28}
                            height={30}
                            alt="user image"
                            src={CommonFunctions.FormatImageSrc(UserImage)}
                          />
                          <span className="account-link">My Account</span>
                        </button>
                        <ul
                          className="dropdown-menu"
                          aria-labelledby="dropdownMenuButton1"
                        >
                          <Link href="/customChannel">
                            <span className="dropdown-item">
                              My Customised Channels
                            </span>
                          </Link>
                          <Link href="/favorites">
                            <span className="dropdown-item">My Fav Shows</span>
                          </Link>

                          <span className="dropdown-item" onClick={onLogout}>
                            Logout
                          </span>

                        </ul>
                      </>
                    ) : (
                      <span
                        className="LogInMode account-link cursor-pointer"
                        onClick={onLoginClick}
                      >
                        {" "}
                        <span className="d-none d-md-block">Login/Sign up</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-person-plus d-md-none LoginModeImage"
                          viewBox="0 0 16 16"
                        >
                          <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H1s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C9.516 10.68 8.289 10 6 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z" />
                          <path
                            fillRule="evenodd"
                            d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5z"
                          />
                        </svg>
                      </span>
                    )}
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>
      <Login
        show={showModal}
        onClose={handleClose}
        onSubmit={onFormSubmit}
        onSignupFormOpen={handleSignupFormOpening}
      />
      <Signup show={isModelOpen} onClose={handleCloseSignupPopup} />
    </>
  );
}
