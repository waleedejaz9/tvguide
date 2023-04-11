import { ChannelDTO } from '@DTO/channel.dto';
import ApiResponse from '@Helper/api-response';
import { ChannelService } from '@Services/channel.service';
import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { ChannelResponseDTO } from '@DTO/channel-response.dto';
import { ElasticSearchCountDTO } from '@DTO/elastic-search-count.dto';
import {Request} from 'express';

@Controller('channel')
export class ChannelController {
  constructor(private channelService: ChannelService) {}

  /**
   * @returns return all channel from mongo db
   */
  @Get('/getAll')
  public async GetAllChannels(): Promise<ApiResponse<ChannelResponseDTO[]>> {
    let response =
      await this.channelService.GetAllChannelsWithSpecificColumns();
    return response;
  }

  @Post('/mapchannelimages')
  public async MapChannelImages(@Body() channelIds: string[]) {
    await this.channelService.MapChannelImagesPathBasedOnChannelIds(channelIds);
  }

  @Get('/seed')
  public async SeedChannels() {
    return await this.channelService.CreateChannels();
  }

  /**
   * @returns return all channel from mongo db
   */
  @Get('/getAllByRegion')
  public async GetAllChannelsByRegion(
    @Query('region') region: string,
  ): Promise<ApiResponse<ChannelResponseDTO[]>> {
    let response = await this.channelService.GetAllChannelsByRegion(region);
    return response;
  }

  /**
   * @returns return total channels for against platform and region
   */
  @Get('/all/:platformId/:epgNumber')
  public async GetChannels(
    @Param('platformId') platformId: string,
    @Param('epgNumber') epgNumber: number,
    @Req() req: Request
  ): Promise<ApiResponse<ChannelDTO[]>> {
    let response = await this.channelService.GetAllChannelsFromElasticSearch(
      platformId,
      epgNumber,
      req.url
    );
    return response;
  }

  @Get('/allList')
  async allList(@Query('offset') offset: string, @Query('limit') limit: string) {
    const result = await this.channelService.listAll(offset, limit);
    return result;
  }

  @Get('/:title')
  async GetScheduleByAssetTitle(@Param('title') title: string) {
    const result =
      await this.channelService.GetAassetScheduleBasedOnChannelTitle(title);
    return result;
  }
}
