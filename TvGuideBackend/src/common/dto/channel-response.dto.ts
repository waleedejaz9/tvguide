import { AutoMap } from '@automapper/classes';
import { ChannelCategoryDTO } from './channel-category.dto';

export class ChannelResponseDTO {
  @AutoMap()
  public Id: string;
  @AutoMap()
  public logo: string;
  @AutoMap()
  public title: string;
}
