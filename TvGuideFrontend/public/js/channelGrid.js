import moment from "moment-timezone";
import { useEffect } from "react";
import Constants from "../../utils/helper/constants";
function channelHandler(channelAssetSchedules) {
  let finalChannels = [];
  for (let c of channelAssetSchedules) {
    finalChannels.push({
      id: c.channel.id,
      title: c.channel.title,
      logo: c.channel.logo,
      // Converting date string into timezone specific moment object
      assetSchedules: c.assetSchedules.map((a) => {
        a.startDate = moment(a.startDate).tz(Constants.TIME_ZONE);
        a.endDate = moment(a.endDate).tz(Constants.TIME_ZONE);
        return a;
      }),
    });
  }
  return finalChannels;
}

function timeCellScreenWidthHandler() {
  const timeCellAnchors =
    document.getElementById("time-cell") &&
    document.getElementById("time-cell").getElementsByTagName("a");

  // if (screen.width < 992 && screen.width > 767) {
  //   if (timeCellAnchors.length > 4) {
  //     for (let i = 4; i < timeCellAnchors.length; i++) {
  //       timeCellAnchors[i].classList.add("d-none");
  //     }
  //   }
  // }

  // if (screen.width < 767) {
  //   if (timeCellAnchors?.length > 2) {
  //     for (let i = 2; i < timeCellAnchors.length; i++) {
  //       timeCellAnchors[i].classList.add("d-none");
  //     }
  //   }
  // }

  // if (screen.width < 992) {
  //   if (timeCellAnchors.length > 6) {
  //     for (let i = 6; i < timeCellAnchors.length; i++) {
  //       timeCellAnchors[i].classList.add("d-none");
  //     }
  //   }
  // }
}

function calculateWidth(finalChannels , prevSlotswidth = 0) {
  let timeCurosel = document.getElementById("time-cell"); // time slots container
  if (timeCurosel) {
    let numberOfItemsDisplayInDOM = getActiveTimeSlots().length || 5; // getActiveTimeSlots  will return an array of child node's data-datetime

    let width = timeCurosel.scrollWidth - 1; // total width of timeslots container
    let averageWidth = width / numberOfItemsDisplayInDOM; // average width each slot[30mints slot] is taken in the dom

    // Calculating 1% so that we can multiply it later by actual ratio
    let wholeBlock = Constants.SLOT_INTERVAL;// single timeslot blok assumes to be of 30 mnts
    const averageMinutePerPx = averageWidth / wholeBlock; // width with respect to pixels on dom
   
    setInterval(() => bindCurrentTimeMarker(averageMinutePerPx), 1000);
    let channelResponse = [];
    let finalAssetMapping = [];
    let prevEndingXAxisPoint = 0;
    let runningCounter = 0;
    
    let description = "";
    for (let finalChannel of finalChannels) { // Channels Iterator
      prevEndingXAxisPoint = 0;
      for (let assetSchedule of finalChannel.assetSchedules) { // asset schedules iterator
        runningCounter++;
        let finalWidthPerPx =
          Math.abs(assetSchedule.duration|| assetSchedule.actualMinute) * averageMinutePerPx; // mapping duration of the show with respect to average minute per pixel
          description =
          assetSchedule.summary?.long ||
          assetSchedule.summary?.medium ||
          assetSchedule.summary?.short ||
          ""
          if(isNaN(prevSlotswidth + prevEndingXAxisPoint)){
            console.log("isNaN", assetSchedule, prevSlotswidth, prevSlotswidth, finalWidthPerPx, prevEndingXAxisPoint)
          }

         
          finalAssetMapping.push({
            name: assetSchedule.title || assetSchedule.name,
            startDate: assetSchedule.startDate,
            endDate: assetSchedule.endDate,
            assetId: assetSchedule.assetId,
            scheduleId: assetSchedule.scheduleId,
            toggleId: "div_" + runningCounter || assetSchedule.toggleId,
            description: description,
            assetImage: assetSchedule.image || assetSchedule.assetImage,
            translateX: `${ prevSlotswidth + prevEndingXAxisPoint}`,
            width: Math.abs(finalWidthPerPx) || 0,
            lessContentClass: "",
            noProgramMode: "",
            actualMinute: assetSchedule.duration || assetSchedule.actualMinute,
            //addressing the timezones of schedules
            formattedStartDate: moment(assetSchedule.startDate)
              .tz(Constants.TIME_ZONE)
              .format(Constants.TIME_FORMAT),
            formattedEndDate: moment(assetSchedule.endDate)
              .tz(Constants.TIME_ZONE)
              .format(Constants.TIME_FORMAT),
          });
          if(finalWidthPerPx){
            prevEndingXAxisPoint += finalWidthPerPx; // each schedule duration multiplied with averageMinutePerPx is added in it beacause of next schedule position
          }
      }
      if(finalChannel.newChannel){
        finalChannel.newChannel = false
      } 
      finalAssetMapping.map((c) => {
        if (c.width < 30) {
          c.lessContentClass = "small-box";
        }
        if (c.name === Constants.NO_SECHEDULER_DATA_TITLE) {
          c.noProgramMode = "disable-slot";
          c.formattedStartDate = "";
          c.name = ""
        }
        c.width = `${c.width}px`;
        c.translateX = `${c.translateX}`;
        return c;
      });
      // console.log({ finalAssetMapping })
      channelResponse.push({
        id: finalChannel.id,
        title: finalChannel.title,
        logo: finalChannel.logo,
        assetSchedules: [...finalAssetMapping],
      });
      finalAssetMapping = [];
    }

    console.log({ channelResponse })
    return channelResponse;
  }
}



function bindCurrentTimeMarker(widthPerMinInPx) {
  //Binding Current Time Marker
  let channelLogoWidth = document.getElementsByClassName(
    "d-flex align-items-center channel-img light-gray-border"
  );
  if (channelLogoWidth?.length) {
    const logoWidth = channelLogoWidth[0].offsetWidth;
    const currentDateTime = moment()
      .tz(Constants.TIME_ZONE)
      .format(Constants.UTC_FORMAT_TIME);
    const days =
      document.getElementsByClassName("calendar-day-slots")[0].children;
    let currentlyActiveDate = moment.tz(Constants.TIME_ZONE).get("date");
    let isCurrentDateSelected = false;
    for (let day of days) {
      if (
        day.classList.contains("active-date") &&
        day.innerText.indexOf(currentlyActiveDate) >= 0
      ) {
        isCurrentDateSelected = true;
        break;
      }
    }

    if (isCurrentDateSelected) {
      const activeTimes = getActiveTimeSlots();
      if (
        moment(currentDateTime).isBetween(
          activeTimes[0],
          activeTimes[activeTimes.length - 1]
        )
      ) {
        let difference = Math.abs(
          moment(currentDateTime).diff(activeTimes[0], "minutes")
        );
        const width = widthPerMinInPx * difference;
        let elem = document.getElementById("marker");
        if (elem) {
          elem.classList.remove("hide");
          elem.classList.add("show");
          elem.setAttribute(
            "style",
            `transform: translateX(${logoWidth + width}px)`
          );
        }
      }
    }
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("scroll", function () {
    if (window.pageYOffset > 90) {
      document.getElementsByClassName("prog-scrollbar")[0] &&
        document
          .getElementsByClassName("prog-scrollbar")[0]
          .classList.add("new-bg-color");
      document.getElementsByClassName("time-scroll")[0] &&
        document
          .getElementsByClassName("time-scroll")[0]
          .classList.add("new-bg-color");
    } else {
      document.getElementsByClassName("prog-scrollbar")[0] &&
        document
          .getElementsByClassName("prog-scrollbar")[0]
          .classList.remove("new-bg-color");
      document.getElementsByClassName("time-scroll")[0] &&
        document
          .getElementsByClassName("time-scroll")[0]
          .classList.remove("new-bg-color");
    }
  });
}

function getActiveTimeSlots() {
  let timeCurosel = document.getElementById("time-cell");
  let times = [];
  for (let child of timeCurosel.children) {
    if (child.offsetWidth > 0 && child.offsetHeight > 0) {
      times.push(child.getAttribute("data-datetime"));
    }
  }
  return times;
}

function showFirstAd() {
  if (
    document.getElementsByClassName("first-ad")[0]?.getElementsByTagName("iframe")?.[0]
  ) {
    return;
  }
  let gas = window.gas || { q: [] }
  gas?.q?.push(() => {
    gas?.slot("ad-leaderboard") // unique id for slot, can be anything
      ?.banner([728, 90])
      ?.insertInside(".first-ad") // takes any CSS selector
      // ?.gam("EDUK/TEST")
      ?.bidder("appnexus", { placementId: 13144370 })

    gas?.fetch() // call fetch to request ads
  })
}

function showSecondAd() {
  if (
    document.getElementsByClassName("second-ad")[0]?.getElementsByTagName("iframe")?.[0]
  ) {
    return;
  }
  let gas = window.gas || { q: [] }
  gas?.slot("ad-mpu1")
    ?.banner([300, 250])
    ?.insertInside(".second-ad")
    // ?.gam("EDUK/TEST")
    ?.bidder("appnexus", { placementId: 13144370 })

  gas.fetch()
}

function showThirdAd() {
  let gas = window.gas || { q: [] }
  gas?.slot("ad-outstream")
    ?.outstream()
    ?.insertInside(".third-ad")
    // ?.gam("EDUK/TEST")
    ?.bidder("appnexus", { placementId: 13232385 })

  gas?.fetch()
}

function showFourthAd() {
  if (
    document.getElementsByClassName("fourth-ad")[0]?.getElementsByTagName("iframe")?.[0]
  ) {
    return;
  }
  let gas = window.gas || { q: [] }
  gas?.q?.push(() => {
    gas?.slot("ad-leaderboard-2") // unique id for slot, can be anything
      ?.banner([728, 90])
      ?.insertInside(".fourth-ad") // takes any CSS selector
      // ?.gam("EDUK/TEST")
      ?.bidder("appnexus", { placementId: 13144370 })

    gas?.fetch() // call fetch to request ads
  })
}

function showFifthAd() {
  if (
    document.getElementsByClassName("fifth-ad")[0]?.getElementsByTagName("iframe")?.[0]
  ) {
    return;
  }
  let gas = window.gas || { q: [] }
  gas?.q?.push(() => {
    gas?.slot("ad-leaderboard-3") // unique id for slot, can be anything
      ?.banner([728, 90])
      ?.insertInside(".fifth-ad") // takes any CSS selector
      // ?.gam("EDUK/TEST")
      ?.bidder("appnexus", { placementId: 13144370 })

    gas?.fetch() // call fetch to request ads
  })
}

function showSixthAd() {
  (function() {
    var cfg = {
        "plr_ConsentString" :"sixth-ad",
        /* EDITABLE: To include a click tracker paste your tracker macro/url below */
        // "plr_ClickURL": "%%CLICK_URL_UNESC%%"
    };
    /* DO NOT EDIT BELOW THIS LINE */
    (function(){var url = "https://cdn.inskinad.com/isfe/publishercode/126090/default.js"; var id = "ism_tag_" + Math.floor((Math.random() * 10e16)); cfg.srv_SectionID = "126090"; cfg.srv_AdvertIDs = "1896361"; cfg.version = "5"; window[id] = cfg; var script = document.createElement("script"); script.src = url + "?autoload&id=" + id; document.getElementsByTagName("head")[0].appendChild(script); })();
})();
}

function showTenthAd() {
  (function() {
    var cfg = {
        "plr_ConsentString" :"tenth-ad",
        /* EDITABLE: To include a click tracker paste your tracker macro/url below */
        // "plr_ClickURL": "%%CLICK_URL_UNESC%%"
    };
    /* DO NOT EDIT BELOW THIS LINE */
    (function(){var url = "https://cdn.inskinad.com/isfe/publishercode/126339/default.js"; var id = "ism_tag_" + Math.floor((Math.random() * 10e16)); cfg.srv_SectionID = "126339"; cfg.srv_AdvertIDs = "1896362"; cfg.version = "5"; window[id] = cfg; var script = document.createElement("script"); script.src = url + "?autoload&id=" + id; document.getElementsByTagName("head")[0].appendChild(script); })();
})();
}

function showSeventhAd() {
  if (
    document.getElementsByClassName("seventh-ad")[0]?.getElementsByTagName("iframe")?.[0]
  ) {
    return;
  }
  let gas = window.gas || { q: [] }
  gas?.q?.push(() => {
    gas?.slot("ad-leaderboard-4") // unique id for slot, can be anything
      ?.banner([728, 90])
      ?.insertInside(".seventh-ad") // takes any CSS selector
      // ?.gam("EDUK/TEST")
      ?.bidder("appnexus", { placementId: 13144370 })
    gas?.fetch() // call fetch to request ads
  })
}
function showEighthAd() {
  if (
    document.getElementsByClassName("eighth-ad")[0]?.getElementsByTagName("iframe")?.[0]
  ) {
    return;
  }
  let gas = window.gas || { q: [] }
  gas?.q?.push(() => {
    gas?.slot("ad-leaderboard-5") // unique id for slot, can be anything
      ?.banner([728, 90])
      ?.insertInside(".eighth-ad") // takes any CSS selector
      // ?.gam("EDUK/TEST")
      ?.bidder("appnexus", { placementId: 13144370 })
    gas?.fetch() // call fetch to request ads
  })
}
function showNinthAd() {
  if (
    document.getElementsByClassName("ninth-ad")[0]?.getElementsByTagName("iframe")?.[0]
  ) {
    return;
  }
  let gas = window.gas || { q: [] }
  gas?.q?.push(() => {
    gas?.slot("ad-leaderboard-6") // unique id for slot, can be anything
      ?.banner([728, 90])
      ?.insertInside(".ninth-ad") // takes any CSS selector
      // ?.gam("EDUK/TEST")
      ?.bidder("appnexus", { placementId: 13144370 })
    gas?.fetch() // call fetch to request ads
  })
}

function removeAdsIframe(){
  
  setTimeout(() => {
    if(document.getElementById('ayads-pull-creative-1'))
      document.getElementById('ayads-pull-creative-1').remove()
  }, 100);
}

module.exports = {
  bindCurrentTimeMarker,
  calculateWidth,
  timeCellScreenWidthHandler,
  channelHandler,
  showFirstAd,
  showSecondAd,
  showThirdAd,
  showFourthAd,
  showFifthAd,
  showSixthAd,
  showSeventhAd,
  showEighthAd,
  showNinthAd,
  showTenthAd,
  removeAdsIframe
};
