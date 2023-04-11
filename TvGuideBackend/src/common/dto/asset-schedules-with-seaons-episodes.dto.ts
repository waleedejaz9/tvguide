export class AssetSchedulesWithSeasonsEpisodesDTO {
  public assetId: string;
  public title: string;
  public description: string;
  public image: string;
  public assetSeasons: {
    scheduleId: string;
    seasonNumber: number;
    episodeNumber: number;
    type: string;
    channelLogo: string;
  };
}
