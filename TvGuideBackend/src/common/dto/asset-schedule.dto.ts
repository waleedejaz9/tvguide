import { AutoMap } from '@automapper/classes';
import { AssetCategoryDTO } from './asset-category.dto';
import { AssetSummaryDTO } from './asset-summary.dto';
import { PlatformDTO } from './platform.dto';

export class AssetScheduleDTO {
  @AutoMap()
  public channelId: string;
  @AutoMap()
  public assetId: string;
  @AutoMap()
  public scheduleId: string;
  @AutoMap()
  public title: string;
  @AutoMap()
  public startDate: string;
  @AutoMap()
  public endDate: string;
  @AutoMap()
  duration: number;
  @AutoMap()
  public image: string;
  @AutoMap(() => [AssetCategoryDTO])
  public category: AssetCategoryDTO[] = [];
  @AutoMap(() => AssetSummaryDTO)
  public summary: AssetSummaryDTO;
  @AutoMap()
  public channelTitle: string;
  @AutoMap()
  public channelLogo: string;
  @AutoMap(() => [PlatformDTO])
  public platforms: PlatformDTO[];
  @AutoMap()
  public type: string;
  @AutoMap()
  public episodeNumber: number;
  @AutoMap()
  public seasonNumber: number;
}
