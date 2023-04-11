export default class Constants {
  public static readonly PRESS_ASSOCIATION_API_BASE_URL: string =
    'https://tv.api.pressassociation.io/v2/';
  public static readonly CHANNEL_SCHEDULE_URL =
    '/schedule?channelId=cId&start=sDate&end=eDate&aliases=true';

  public static readonly ERROR_MESSAGE_WHEN_NO_SCHEDULE_RESPONSE =
    'No schedule data found';

  public static readonly GENERIC_ERROR_INSERT_MESSAGE =
    'There is some error while inserting this collection!.';

  public static readonly TIME_ZONE = 'Europe/London';

  public static readonly UTC_STRING_FORMAT = 'YYYY-MM-DDTHH:mm:ssZ';

  public static readonly POPULAR_PLATFORM_TITLE = 'Popular Channels';
  public static readonly MY_CHANNEL_PLATFORM_TITLE = 'My Channels';

  public static readonly NO_SECHEDULER_DATA_TITLE = 'No scheduler data';
  public static readonly DEFAULT_GENRE = 'All';
  public static readonly UTC_STRING_FORMAT_WITHOUT_TIME_ZONE =
    'YYYY-MM-DDTHH:mm:ss';

  public static readonly ASSET_SCHEDULE_URL_ELASTIC_SEARCH =
    'schedule_dev_index_test';
}
