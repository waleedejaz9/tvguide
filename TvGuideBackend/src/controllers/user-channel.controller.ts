import { CreateMyChannelListDTO } from '@DTO/create-my-channel-list.dto';
import ApiResponse from '@Helper/api-response';
import { UserChannelService } from '@Services/user-channel.service';
import { MyChannelDocument } from '@Entities/my-channels.entity';
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Delete,
  Put,
  Param,
} from '@nestjs/common';
import { ChannelDTO } from '@DTO/channel.dto';
import { ChannelListDTO } from '@DTO/channelList.dto';

@Controller('userchannel')
export class UserChannelController {
  constructor(private readonly userChannelService: UserChannelService) { }

  /**
   * @returns returns user channel List
   */
  @Put()
  public async UpdateUserChannel(
    @Query('userId') userId: string,
    @Body() userChannelPayload: CreateMyChannelListDTO,
  ) {
    let response = await this.userChannelService.UpdateUserChannel(
      userId,
      userChannelPayload,
    );
    return response;
  }
  /**
   * @returns returns replaces channel List in my channel collection in mongo db
   */
  @Put('/replace')
  public async ReplaceUserChannel(
    @Query('userId') userId: string,
    @Body() userChannelPayload: CreateMyChannelListDTO,
  ) {
    let response = await this.userChannelService.ReplaceUserChannel(
      userId,
      userChannelPayload,
    );
    return response;
  }

  /**
   * @returns deletes channel List in my channel collection in mongo db
   */
  @Delete()
  public async DeleteUserChannel(
    @Query('userId') userId: string,
    @Body() channelDetails: [],
  ): Promise<ApiResponse<string>> {
    let response = await this.userChannelService.DeleteUserChannel(
      userId,
      channelDetails,
    );
    return response;
  }

  /**
   * @returns return all user selected channel from mongo db
   */
  @Get('/getAllUserChannelById')
  public async GetAllUserChannels(
    @Query('userId') userId: string,
  ): Promise<ApiResponse<CreateMyChannelListDTO>> {
    let response = await this.userChannelService.GetAllUserChannels(userId);
    return response;
  }

  /**
   * @returns return all user selected channel from mongo db
   */
  @Get('/:userId')
  public async GetAllUserCustomizedChannels(
    @Param('userId') userId: string,
  ): Promise<ApiResponse<ChannelListDTO>> {
    let response = await this.userChannelService.GetAllChannelsDataForUser(
      userId,
    );
    return response;
  }
}
