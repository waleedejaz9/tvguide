import ApiResponse from '@Helper/api-response';
import {
  Controller,
  Delete,
  Get,
  Param,
  Query,
  UsePipes,
  Req
} from '@nestjs/common';
import { ScheduleService } from '@Services/schedule.service';
import { ValidationPipe } from '@nestjs/common';
import { AssetScheduleRequestDTO } from '@DTO/asset-schedule-request.dto';
import { ChannelAssetScheduleResponseDTO } from '@DTO/channel-asset-schedule-response.dto';
import {Request} from 'express';
@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get('/list')
  @UsePipes(
    new ValidationPipe({
      transform: true,
    }),
  )
  async GetSchedulesFromElasticDB(
    @Query() filters: AssetScheduleRequestDTO,
    @Req() req: Request
  ): Promise<ApiResponse<ChannelAssetScheduleResponseDTO[]>> {
    const result = await this.scheduleService.GetAssetsSchedules(filters, req.url);
    return result;
  }

  @Get('/suggest/:text')
  async GetSuggestions(@Param('text') searchText: string) {
    const result = await this.scheduleService.GetSuggestions(searchText);
    return result;
  }

  @Get('/:title/:lastDateTime')
  async GetScheduleByAssetTitle(
    @Param('title') title: string,
    @Param('lastDateTime') lastDateTime?: string,
  ) {
    const result = await this.scheduleService.GetAassetScheduleBasedOnItsTitle(
      title,
      lastDateTime,
    );
    return result;
  }

  @Delete('/current/:date')
  async RemoveAllDataFromCurrentDateTime(@Param('date') date: string) {
    return await this.scheduleService.DeleteOldSchedulesFromElasticSearch(false, date);
  }

  @Delete('/current/db/:date')
  async RemoveAllDataFromCurrentDateTimeMongoDB(@Param('date') date: string) {
    return await this.scheduleService.DeleteOldSchedulesFromMongoDB(false, date);
  }

  @Get('/allList')
  async allList(@Query('offset') offset: string, @Query('limit') limit: string) {
    const result = await this.scheduleService.listAll(offset, limit);
    return result;
  }
}
