import { AssetScheduleDTO } from './asset-schedule.dto';

export class SingleChannelAssetScheduleResponseDTO {
  /**
   *  This is used to initialize the array with default value
   */
  constructor() {
    this.assetSchedules = [];
    this.channel = {
      title: '',
      logo: '',
    };
  }
  public channel: {
    title: string;
    logo: string;
  };
  public assetSchedules: AssetScheduleDTO[];
}
