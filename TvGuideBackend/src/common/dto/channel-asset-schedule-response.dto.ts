import { AssetScheduleDTO } from './asset-schedule.dto';

export class ChannelAssetScheduleResponseDTO {
  /**
   *  This is used to initialize the array with default value
   */
  constructor() {
    this.assetSchedules = [];
  }
  public channel: {
      id: string;
    };
  public assetSchedules: AssetScheduleDTO[];
}
  