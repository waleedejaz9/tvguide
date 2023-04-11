import cookieCutter from "cookie-cutter";
import moment from "moment-timezone";
import Constants from "./helper/constants";
import AES from "crypto-js/aes";
import CryptoJs from "crypto-js/core";
import getConfig from 'next/config';
const { publicRuntimeConfig } = getConfig();

export class CommonFunctions {
  public static GetLoggedInUser() {
    let user = cookieCutter.get("user");
    if (!user) return null;
    user = JSON.parse(user);
    let secretKey = publicRuntimeConfig.apiURL;
    let bytes = AES.decrypt(user.id, secretKey);
    let userId = bytes.toString(CryptoJs.enc.Utf8);
    user.id = userId;
    return user;
  }

  public static setEncryption(id) {
    let secretKey = publicRuntimeConfig.apiURL;
    let userId = AES.encrypt(id, secretKey).toString();
    return userId;
  }

  public static LogoutUser() {
    localStorage.clear();
    cookieCutter.set("user", null, {
      expires: "Thu, 01 Jan 1970 00:00:00 GMT",
      path: "/",
      domain: window.location.hostname,
    });
  }
  public static SetUser(user) {
    user.id = this.setEncryption(user.id);
    const tomorrow = new Date(new Date().getTime());
    tomorrow.setDate(new Date().getDate() + 1);
    cookieCutter.set("user", JSON.stringify(user), {
      expires: tomorrow,
      path: "/",
      domain: window.location.hostname,
    });
  }

  public static GetDate(date: any) {
    return moment(date).tz(Constants.TIME_ZONE);
  }

  public static ConvertTime12To24(time) {
    var hours = Number(time.match(/^(\d+)/)[1]);
    var minutes = Number(time.match(/:(\d+)/)[1]);
    var AMPM = time.match(/\s(.*)$/)[1];
    if (AMPM === "PM" && hours < 12) hours = hours + 12;
    if (AMPM === "AM" && hours === 12) hours = hours - 12;
    var sHours = hours.toString();
    var sMinutes = minutes.toString();
    if (hours < 10) sHours = "0" + sHours;
    if (minutes < 10) sMinutes = "0" + sMinutes;
    return sHours + ":" + sMinutes;
  }

  public static ConvertTime = (timeStr) => {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":");
    if (hours === "12") {
      hours = "00";
    }
    if (modifier === "PM") {
      hours = parseInt(hours, 10) + 12;
    }
    return `${hours}:${minutes}`;
  };

  public static ResetCachedCustomizedChannels() {
    localStorage.removeItem(Constants.USER_CUSTOMIZED_CHANNEL_KEY);
    localStorage.removeItem(Constants.USER_CUSTOMIZED_CHANNEL_KEY_TOTAL_PAGES);
    localStorage.removeItem(Constants.USER_CUSTOMIZED_CHANNEL_KEY_CURRENTPAGE);
  }

  public static FormatUrl(url) {
    if (!url) return ''
    else return url.replaceAll(' ', '-')
  }

  public static ResetChachedDefaultChannels() {
    localStorage.removeItem(Constants.CHANNEL_KEY);
    localStorage.removeItem(Constants.CHANNEL_KEY_TOTAL_PAGES);
    localStorage.removeItem(Constants.CHANNEL_KEY_CURRENT_PAGE);
  }

  public static ResetDefaultChannelPageCounter() {
    localStorage.removeItem(Constants.CHANNEL_KEY_CURRENT_PAGE);
  }

  public static Paginate = (array, pageSize, pageNumber) => {
    return array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
  };
  public static detectOS() {
    let userAgent = navigator.userAgent;
    let OSname;
    if (userAgent.match("Mac")) {
      OSname = "Mac";
    }
    else if (navigator.userAgent.match("Windows")) {
      OSname = "Windows";
    }
    else if (navigator.userAgent.match("Linux")) {
      OSname = "Linux"
    }
    return OSname;
  }
  public static detectBrowser() {
    let userAgent = navigator.userAgent;
    let browserName;
    if (userAgent.match(/chrome|chromium|crios/i)) {
      browserName = "chrome";
    } else if (userAgent.match(/firefox|fxios/i)) {
      browserName = "firefox";
    } else if (userAgent.match(/safari/i)) {
      browserName = "safari";
    } else if (userAgent.match(/opr\//i)) {
      browserName = "opera";
    } else if (userAgent.match(/edg/i)) {
      browserName = "edge";
    } else {
      browserName = "No browser detection";
    }
    return browserName;
  }

  /**
   * Observer to be used for infinite scrolling
   * @param selector 
   * @param threshold 
   * @param cb 
   * @param element 
   */
  public static Observe(selector, threshold, cb, element = false){
    let elem = element ? selector : document.querySelector(selector);
    threshold = threshold || 100;
    if(elem !== null){
      if ("IntersectionObserver" in window) {
        let elemObserver = new IntersectionObserver((entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              let target = entry.target;
              cb();
              elemObserver.unobserve(target);
            }
          })
        }, {
          rootMargin: '0px 0px '+threshold+'px 0px'
        });
        elemObserver.observe(elem);
      }
      else cb();
    }
  }

  public static FormatImageSrc(src){
    if(src?.src) return src;
    else{
      if(src && (src.indexOf("/") == 0 || src.indexOf("http") == 0)) return src;
      else return "/tv-guide/blank-image.jpeg";
    }
  }
  
}
