export default class Constants {
  /**
   * This interval range defines in minutes and it will be used to determine the time slots gap.
   */
  public static readonly INTERVAL_RANGE = 1440;
  /**
   * This interval define at how interval these slots will print.
   */
  public static readonly SLOT_INTERVAL = 30;
  public static readonly TIME_ZONE = "Europe/London";
  public static readonly UTC_FORMAT_TIME = "YYYY-MM-DDTHH:mm:ssZ";
  public static readonly POPULAR_PLATFORM_TITLE = "Popular Channels";
  public static readonly MY_CHANNEL_PLATFORM_TITLE = "My Channels";
  public static readonly NO_SECHEDULER_DATA_TITLE = "No scheduler data";
  public static readonly NO_CUSTOMIZED_CHANNELS_DATA_FOUND =
    "Currently, you have no customized channels.";
  public static readonly CUSTOMIZED_CHANNEL_PAGE_SIZE = 10;
  public static readonly USER_CUSTOMIZED_CHANNEL_KEY = "customized";
  public static readonly USER_CUSTOMIZED_CHANNEL_KEY_TOTAL_PAGES = "totalPages";
  public static readonly USER_CUSTOMIZED_CHANNEL_KEY_CURRENTPAGE =
    "currentPage";
  public static readonly UPDATE_HAS_MORE = "UPDATE_HAS_MORE";
  public static readonly UPDATE_CHANNEL_COUNT = "UPDATE_CHANNEL_COUNT";
  public static readonly UPDATE_TOTAL_RECORDS = "UPDATE_TOTAL_RECORDS";
  public static readonly UPDATE_CHANNEL_LIST = "UPDATE_CHANNEL_LIST";
  public static readonly UPDATE_EPG_NUMBER = "UPDATE_EPG_NUMBER";
  public static readonly RESET_STATE = "RESET_STATE";
  public static readonly UPDATE_TIME_CROUSEL_DATA = "UPDATE_TIME_CROUSEL_DATA";

  public static readonly UPDATE_ASSET_SCHEDULE_DATA = "UPDATE_ASSET_SCHEDULE_DATA";
  public static readonly UPDATE_RESIZE_SCHEDULE_DATA = "UPDATE_RESIZE_SCHEDULE_DATA";
  public static readonly TIME_FORMAT = "h:mm A";
  public static readonly DEFAULT_GENRE = "All";



  // For fetching schedules in chunk
  public static readonly CHANNEL_PAGE_SIZE = 10;
  public static readonly CHANNEL_KEY = "defaultChannels";
  public static readonly CHANNEL_KEY_TOTAL_PAGES = "defaultChannelsTotalPages";
  public static readonly CHANNEL_KEY_CURRENT_PAGE =
    "defaultChannelsCurrentPage";
}
