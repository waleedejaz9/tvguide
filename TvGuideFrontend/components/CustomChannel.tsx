import { faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import ChannelBar from "./ChannelBar";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import AxiosHelper from "../utils/helper/axios.helper";
import { CommonFunctions } from "../utils/common-functions";
import MyChannelBar from "../components/MyChannelBar"
import Link from "next/link";

const chIcons = [
  {
    key: "trashButton",
    title: "Trash",
    icon: faTrash,
    function: null,
    type: "default ",
  },
  {
    key: "plusButton",
    title: "Plus",
    icon: faPlus,
    function: null,
    type: "default ",
  },
];
const CustomChannel = () => {
  const router = useRouter();

  const [showDropdown, setShowDropdown] = useState(false)

  const [channelList, setChannelList] = useState([]);
  const [showChannels, canShowChannels] = useState(false);
  const [selectedChannelList, setSelectedChannelList] = useState([]);
  const [region, setRegions] = useState([]);
  const [radioValue, setRadioValue] = useState(0);
  const [defaultRegion, setDefaultRegion] = useState();
  //save reference for dragItem and dragOverItem

  const allowedBackToHomeRoutes = ["/customChannel", "/favorites"];

  const dragItem = useRef<any>(null);
  const dragOverItem = useRef<any>(null);
  let tempChannelList = [];

  const checkedIsActive = (i) => {
    setDefaultRegion(i);
    setShowDropdown(false);
  };
  const onClickOfRegion = (e) => {
    fetchAllChannelsByRegion(defaultRegion);
  };
  //const handle sorting
  const handleSort = () => {
    CommonFunctions.ResetCachedCustomizedChannels();
    let user = CommonFunctions.GetLoggedInUser();
    if (!user) {
      user = "";
      canShowChannels(false);
      return;
    }
    //duplicate items
    let _channelItems = [...selectedChannelList];
    //remove and save the dragged item content
    const draggedItemContent = _channelItems.splice(dragItem.current, 1)[0];
    //switch the position
    _channelItems.splice(dragOverItem.current, 0, draggedItemContent);
    //reset the position ref
    dragItem.current = null;
    dragOverItem.current = null;
    //update the actual array
    let req = new AxiosHelper(`/userchannel/replace?userId=${user.id}`);
    setSelectedChannelList(_channelItems);
    let payload = {
      userId: user.id,
      channelList: _channelItems,
    };
    req.put(user.id, payload).then((e) => { });
  };

  const deleteChannel = async (item) => {
    CommonFunctions.ResetCachedCustomizedChannels();
    let user = CommonFunctions.GetLoggedInUser();
    if (!user) {
      user = "";
      canShowChannels(false);
      return;
    }
    const updatedChannelsArray = selectedChannelList.filter(
      (channel) =>
        selectedChannelList.indexOf(channel) !=
        selectedChannelList.indexOf(item)
    );
    try {
      let req = new AxiosHelper(`/userchannel?userId=${user.id}`);
      let payload = {
        channelList: [item],
      };
      let res = await req.delete(user.id, payload);
      let allChannels = channelList;
      if (!allChannels.some((userChannel) => userChannel.Id === item.Id)) {
        allChannels.push(item);
        setChannelList(
          allChannels.sort((a, b) => a.title.localeCompare(b.title))
        );
      }
      if (res) {
        setSelectedChannelList(updatedChannelsArray);
        tempChannelList = [updatedChannelsArray];
      }
    } catch (e: any) {
      console.log(e);
    }
  };

  const addChannelToSelectedChannelList = async (item) => {
    CommonFunctions.ResetCachedCustomizedChannels();

    let user = CommonFunctions.GetLoggedInUser();
    if (!user) {
      user = "";
      canShowChannels(false);
      return;
    }
    if (!selectedChannelList.some((channel) => channel.Id === item.Id)) {
      let req = new AxiosHelper(`/userchannel?userId=${user.id}`);
      tempChannelList = [item, ...selectedChannelList];
      let payload = {
        userId: user.id,
        channelList: tempChannelList,
      };
      await req.put(user.id, payload);
      setSelectedChannelList([item, ...selectedChannelList]);
      let allChannels = [];
      for (let channel of channelList) {
        if (channel.Id !== item.Id) {
          allChannels.push(channel);
        }
      }
      setChannelList(
        allChannels.sort((a, b) => a.title.localeCompare(b.title))
      );
    } else {
      alert("channel already selected.");
    }
  };
  const fetchAllChannels = async (userChannels) => {
    let user = CommonFunctions.GetLoggedInUser();

    if (!user) {
      user = "";
      canShowChannels(false);
      return;
    }
    try {
      let req = new AxiosHelper(`/channel/getAll`);
      let res = await req.get();
      let temp = [];
      if (res?.success && res?.data) {
        if (!userChannels) {
          setChannelList(
            res?.data.sort((a, b) => a.title.localeCompare(b.title))
          );
        } else {
          for (let channel of res.data) {
            if (
              !userChannels.some((userChannel) => userChannel.Id === channel.Id)
            ) {
              temp.push(channel);
            }
          }
        }

        setChannelList(temp.sort((a, b) => a.title.localeCompare(b.title)));
        canShowChannels(true);
      } else {
        setChannelList(temp.sort((a, b) => a.title.localeCompare(b.title)));
        canShowChannels(false);
      }
    } catch (e: any) {
      console.log(e);
    }
  };
  const fetchAllChannelsByRegion = async (region) => {
    try {
      let req = new AxiosHelper(`channel/getAllByRegion?region=${region}`);
      let res = await req.get();
      let temp = [];
      if (res?.success && res?.data) {
        if (!selectedChannelList) {
          setChannelList(
            res?.data.sort((a, b) => a.title.localeCompare(b.title))
          );
        } else {
          for (let channel of res.data) {
            if (
              !selectedChannelList.some(
                (selectedChannel) => selectedChannel.Id === channel.Id
              )
            ) {
              temp.push(channel);
            }
          }
        }
        setChannelList(temp.sort((a, b) => a.title.localeCompare(b.title)));
        canShowChannels(true);
      } else {
        setChannelList(temp.sort((a, b) => a.title.localeCompare(b.title)));
        canShowChannels(false);
      }
    } catch (e: any) {
      console.log(e);
    }
  };
  const fetchSelectedChannels = () => {
    return new Promise(async (resolve, reject) => {
      let user = CommonFunctions.GetLoggedInUser();
      if (!user) {
        user = "";
        canShowChannels(false);
        return;
      }
      try {
        let req = new AxiosHelper(
          `/userchannel/getAllUserChannelById?userId=${user.id}`
        );
        let res = await req.get();
        if (res.success && res.data) {
          let channelList = res.data.channelList;
          setSelectedChannelList(channelList);
          canShowChannels(true);
          resolve(channelList);
        } else {
          setSelectedChannelList([]);
          canShowChannels(false);
          return resolve([]);
        }
      } catch (e: any) {
        console.log(e);
        reject(e);
      }
    });
  };
  const fetchRegions = () => {
    let server = new AxiosHelper(`/region/getAll`);
    server
      .get()
      .then((res: any) => {
        const regions = res.data;
        setRegions(regions);
      })
      .catch((error: any) => {
        console.log(error);
      });
  };


  useEffect(() => {

    try {
      fetchSelectedChannels().then((result) => {
        fetchAllChannels(result);
      });
      fetchRegions();
    } catch (e) {

      console.log(e)
    }

  }, [])

  const dropdownHandler = () => {
    setShowDropdown(prevState => !prevState);
  }

  return (
    <div className="container customized py-5 custom-channel">
      <div>
        <div className="d-flex py-md-4 py-2 region-group-container px-4">
          <div className="d-flex justify-content-between region-filter-wrapper">
            <div className="region-drop">
              <div className="nav-item dropdown">
                <a
                  onClick={dropdownHandler}
                  className="nav-link dropdown-toggle fs-md"
                  data-toggle="dropdown"
                  href="#"
                  id="navbarDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {defaultRegion ? (
                    <span>{defaultRegion}</span>
                  ) : (
                    <span>My Region</span>
                  )}
                </a>

                <ul
                  className={`dropdown-menu border-0 shadow-sm fs-md ${showDropdown && `show`
                    }`}
                  aria-labelledby="navbarDropdown"
                >
                  <li>
                    {region.map((option, index) => (
                      <a
                        className="dropdown-item"
                        onClick={(e) => checkedIsActive(option.regionName)}
                        key={index}
                      >
                        <div className="form-check">
                          <input
                            data-toggle="dropdown"
                            className="form-check-input "
                            onChange={() => { }}
                            type="radio"
                            checked={defaultRegion === option.regionName}
                            name="channel"
                            value={option.regionName}
                            id={option.regionId}
                          />
                          <label
                            className="form-check-label cursor-pointer"
                            htmlFor={option.regionId}
                          >
                            {" "}
                            {option.regionName}
                          </label>
                        </div>
                      </a>
                    ))}
                  </li>
                </ul>
              </div>
            </div>
            <div className="custom-channel-filter">
              <button
                className="btn btn-primary rounded-pill solid-button-aimation applayFilter"
                onClick={onClickOfRegion}
              >
                Apply Filter
              </button>
            </div>
          </div>
          <Link href="/">
            <button
              className="btn btn-primary rounded-pill save-btn solid-button-aimation"
              onClick={() => router.push("/")}
            >
              Save
            </button>
          </Link>
        </div>
      </div>
      <div className="row mx-0 custom-channel-cols">
        <div className="col-md-3 selected-channel-box">
          <h4 className="custom-channel-heading">My Selected Channels</h4>
          <p className="heading-para">
            Drag to re-order or press X to remove from your selection
          </p>
          <>
            <div className="table-responsive row mx-0">
              <table className="table">
                <tbody>
                  {selectedChannelList.map((item, index) => (
                    <tr
                      key={index}
                      className="list-container"
                      draggable
                      onDragStart={(e) => (dragItem.current = index)}
                      onDragEnter={(e) => (dragOverItem.current = index)}
                      onDragEnd={handleSort}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      <td className="list-item">
                        <MyChannelBar
                          chName={item.title}
                          imgCh={item.logo}
                          chIcon={chIcons[0].icon}
                          onClickEvent={(e) => {
                            e.preventDefault();
                            deleteChannel(item);
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        </div>
        <div className="col-md-9 add-channel-box">
          <h4 className="custom-channel-heading">Add Channel</h4>
          <p className="heading-para">
            Click on channel to add to my selected channels
          </p>
          <div className="row mx-0">
            <>
              {showChannels &&
                channelList.map((item, index) => {
                  return (
                    <div
                      key={index}
                      className={
                        index === 0
                          ? "col-md-4 ps-0 list-container"
                          : "col-md-4 ps-0 list-container"
                      }
                    >
                      <ChannelBar
                        chName={item.title}
                        className="list-item"
                        imgCh={item.logo}
                        chIcon={chIcons[1].icon}
                        onClickEvent={(e) => {
                          e.preventDefault();
                          addChannelToSelectedChannelList(item);
                        }}
                      />
                    </div>
                  );
                })}
            </>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CustomChannel;