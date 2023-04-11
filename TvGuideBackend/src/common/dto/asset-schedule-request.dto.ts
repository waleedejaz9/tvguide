import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class AssetScheduleRequestDTO {
  @IsNotEmpty()
  platformId: string;
  @IsOptional()
  category: string;
  @IsNotEmpty()
  selectedStartDateTime: string;
  @IsNotEmpty()
  selectedEndDateTime: string;
  @IsNotEmpty()
  @Transform(({ value }) => value.split(','))
  channelIds: string[];
}
