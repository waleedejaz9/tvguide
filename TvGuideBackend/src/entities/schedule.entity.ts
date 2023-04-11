import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AutoMap } from '@automapper/classes';
import { AssetCategoryDTO } from '@DTO/asset-category.dto';
import { AssetSummaryDTO } from '@DTO/asset-summary.dto';
import { PlatformDTO } from '@DTO/platform.dto';

export type ScheduleDocument = Schedule & Document;

@Schema()
export class Schedule extends Document {
  @Prop()
  @AutoMap()
  channelId: string;
  @Prop()
  @AutoMap()
  assetId: string;
  @Prop()
  @AutoMap()
  scheduleId: string;
  @Prop()
  @AutoMap()
  title: string;
  @Prop()
  @AutoMap()
  startDate: Date;
  @Prop()
  @AutoMap()
  endDate: Date;
  @Prop()
  @AutoMap()
  duration: number;
  @Prop()
  @AutoMap()
  image: string;
  @Prop()
  @AutoMap(() => AssetCategoryDTO)
  category: AssetCategoryDTO[];
  @Prop()
  @AutoMap(() => AssetSummaryDTO)
  summary: AssetSummaryDTO;
  @Prop()
  @AutoMap()
  channelTitle: string;
  @Prop()
  @AutoMap()
  channelLogo: string;
  @Prop()
  @AutoMap(() => [PlatformDTO])
  platforms: PlatformDTO[] = [];
  @Prop()
  @AutoMap()
  type: string;
  @Prop()
  @AutoMap()
  episodeNumber: number;
  @Prop()
  @AutoMap()
  seasonNumber: number;
}

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);
