import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { AssetCategoryDTO } from '@DTO/asset-category.dto';
import { AssetScheduleDTO } from '@DTO/asset-schedule.dto';
import { BaseDTO } from '@DTO/base.dto';
import { ChannelDTO } from '@DTO/channel.dto';
import { GlobalConfigurationDTO } from '@DTO/global-configuration.dto';
import { PlatformDTO } from '@DTO/platform.dto';
import ApiResponse from '@Helper/api-response';
import AxiosHelper from '@Helper/axios.helper';
import Constants from '@Helper/constants';
import ResponseHelper from '@Helper/response-helper';
import { HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { add } from 'date-fns';
import moment from 'moment';
import { ChannelService } from './channel.service';
import { GlobalConfigurationService } from './global-configuration.service';
import { ScheduleService } from './schedule.service';

/**
 * This Service is responsible to manage data from an API and store it into mongoDB.
 * It will also be responsible for managing seed data i.e grab master records for first time...
 */
@Injectable()
export class PressAssociationService implements OnModuleInit {
  /**
   * This is constructor where we are injecting multiple services in order to store data..
   */
  constructor(
    private scheduleService: ScheduleService,
    private channelService: ChannelService,
    private globalConfigurationService: GlobalConfigurationService,
    private configurationService: ConfigService,
    private schedulerRegistry: SchedulerRegistry,
    private axios: AxiosHelper,
  ) {}
  onModuleInit() {
    const job = new CronJob(
      this.configurationService.get<string>('CRON_EXPR'),
      async () => {
        try {
          //await this.FetchChannelsAssetsSchedule();
          await this.FetchChannelsAssetsScheduleOneByOne();
        } catch (e) {
          console.log(e);
        }
      },
    );
    this.schedulerRegistry.addCronJob(`FETCH CHANNEL PROGRAM'S SCHEDULES`, job);
    job.start();
  }

  /**
   * It is basically fetching channel's asset's schedules.
   * First time it will fetch the data for all channels for 14 days.
   * Then from next day onwards it will fetch the data for every 15th day from now and will dump that inside our mongoDB.
   */
  public async FetchChannelsAssetsSchedule(): Promise<ApiResponse<BaseDTO[]>> {
    // Grab channels..
    console.log(`Grabbing channels from DB ${new Date()}`);
    const channels = await this.channelService.GetAllChannels();
    console.log(`Grab channels at ${new Date()}`);
    //TODO: Need to return appropriate response
    let scheduleResult: ApiResponse<BaseDTO[]> = ResponseHelper.CreateResponse<
      BaseDTO[]
    >(null, HttpStatus.OK);
    try {
      //Here we will be fetching channels platform wise
      console.log(`process started: ${new Date()}`);
      let IsJobRunForFirstTime: boolean;
      const intervalConfiguration =
        await this.globalConfigurationService.getConfig();
      if (intervalConfiguration.data) {
        IsJobRunForFirstTime =
          intervalConfiguration.data.isJobHasBeenRunningFirstTime;
      } else {
        const config = new GlobalConfigurationDTO();
        config.isJobHasBeenRunningFirstTime = true;
        await this.globalConfigurationService.createConfig(config);
        IsJobRunForFirstTime = true;
      }
      this.processChannelsAssetSchedule(channels.data, IsJobRunForFirstTime)
        .then(async (assets: AssetScheduleDTO[]) => {
          console.log(`total assets ${assets.length}`);
          console.log(`process ended: ${new Date()}`);
          const existingConfig =
            await this.globalConfigurationService.getConfig();
          await this.globalConfigurationService.findReplaceConfig({
            ...existingConfig.data,
            isJobHasBeenRunningFirstTime: false,
          });
          console.log(`starting dumping in DB ${new Date()}`);
          if (assets.length) {
            return this.storeSchedulesInDB(assets);
          } else {
            return new Promise((resolve) => resolve([]));
          }
        })
        .then(async () => {
          console.log(`finish dumping in DB ${new Date()}`);
        })
        .catch((e) => {
          console.log('in exception');
          console.log(e);
        });
    } catch (e: any) {
      // TODO: Will add logging..
      console.error('Error in main thread');
      console.log(e);
    } finally {
      return scheduleResult;
    }
  }

  private async processChannelsAssetSchedule(
    channels: ChannelDTO[],
    isJobRunFirstTIme: boolean,
    alreadyMappedChannels: any[] = null,
  ): Promise<AssetScheduleDTO[]> {
    return new Promise((resolve, reject) => {
      let intervalToCallAPI: number = 0;
      // List of channels which are failed to get the data during this process. It be re-fetched again..
      let failedChannels = [];
      // It's the channel's asset schedule response in a mapped form so it will be inserted in our DB as it is.
      // we are recursively calling this so if we have already successfully mapped channels so we are just re-assigning that.
      let assetMappedResponse: AssetScheduleDTO[] = alreadyMappedChannels || [];
      // Counter to determine how many channels has been processed and return control to caller once all channels get
      // processed.
      let numberOfChannelsProcessed = 0;

      //Store data after mapping response from API
      let apiMappedResponse: AssetScheduleDTO[] = [];
      const API_INTERVAL_GAP = parseInt(
        this.configurationService.get<string>('API_DATA_INTERVAL_GAP'),
      );
      const API_FETCH_INTERVAL = parseInt(
        this.configurationService.get<string>('API_DATA_FETCH_INTERVAL'),
      );
      for (let channel of channels) {
        intervalToCallAPI += API_FETCH_INTERVAL;
        ((interval, ch) => {
          setTimeout(async () => {
            try {
              if (ch.Id) {
                let channelAssetScheduleResponse =
                  await this.fetchChannelAndItsScheduleBasedOnInterval(
                    ch.Id,
                    isJobRunFirstTIme,
                  );
                numberOfChannelsProcessed++;
                if (channelAssetScheduleResponse?.item?.length) {
                  apiMappedResponse = this.mapAPIScheduleAPIResponse(
                    channelAssetScheduleResponse?.item,
                    ch,
                  );
                  assetMappedResponse.push(...apiMappedResponse);
                }
                if (numberOfChannelsProcessed === channels.length) {
                  console.log(
                    `failed Channels length ${failedChannels.length}`,
                  );
                  // Calling again this if we have any failed channels
                  if (failedChannels.length) {
                    setTimeout(() => {
                      console.log('calling again for failed channels');
                      this.processChannelsAssetSchedule(
                        failedChannels,
                        isJobRunFirstTIme,
                        assetMappedResponse,
                      ).then((r) => {
                        console.log('in internal resolve');
                        console.log(`channelId failed : ${ch.Id}`);
                        resolve(r);
                      });
                    }, API_INTERVAL_GAP);
                  } else {
                    console.log(
                      `creating asset schedules ${assetMappedResponse.length}`,
                    );
                    resolve(assetMappedResponse);
                  }
                }
              } else {
                numberOfChannelsProcessed++;
                if (numberOfChannelsProcessed === channels.length) {
                  console.log(
                    `failed Channels length ${failedChannels.length}`,
                  );
                  // Calling again this if we have any failed channels
                  if (failedChannels.length) {
                    setTimeout(() => {
                      console.log('calling again for failed channels');
                      this.processChannelsAssetSchedule(
                        failedChannels,
                        isJobRunFirstTIme,
                        assetMappedResponse,
                      ).then((r) => {
                        console.log('in internal resolve');
                        console.log(`channelId failed : ${ch.Id}`);
                        resolve(r);
                      });
                    }, API_INTERVAL_GAP);
                  } else {
                    console.log(
                      `creating asset schedules ${assetMappedResponse.length}`,
                    );
                    resolve(assetMappedResponse);
                  }
                }
              }
            } catch (e) {
              numberOfChannelsProcessed++;
              if (ch.Id) {
                failedChannels.push({ id: ch.Id });
              }
              if (numberOfChannelsProcessed === channels.length) {
                console.log(`failed Channels length ${failedChannels.length}`);
                console.log(failedChannels);
                // Calling again this if we have any failed channels
                if (failedChannels.length) {
                  setTimeout(() => {
                    this.processChannelsAssetSchedule(
                      failedChannels,
                      isJobRunFirstTIme,
                      assetMappedResponse,
                    ).then((r) => {
                      console.log('in internal resolve');
                      console.log(`channelId failed : ${ch.Id}`);
                      resolve(r);
                    });
                  }, API_INTERVAL_GAP);
                } else {
                  console.log(
                    `creating asset schedules in catch ${assetMappedResponse.length}`,
                  );
                  resolve(assetMappedResponse);
                }
                reject(e);
              }
              //TODO: Logging required
            }
          }, interval);
        })(intervalToCallAPI, channel);
      }
    });
  }

  /**
   * It will fetch channel and schedule for specified interval.
   * First time it will fetch 14 days data and then after wards it will fetch only 1day after 14 days.
   * @Params channelId this will be the channel for which we are going to fetch channel's schedule
   * @Params isFirstTimeCalled this is checking if cron job is running for very first time. By default it will be true.
   */
  private async fetchChannelAndItsScheduleBasedOnInterval(
    channelId: string,
    isFirstTimeCalled: boolean = true,
  ): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const data = {
        cId: channelId,
        sDate: null,
        eDate: null,
      };
      // After first time we will grab fifteenth day data and dump it in our db.
      // As per the business rule on very first time we will fetch 14 days data and after wards we will fetch every fifteenth
      // day data.
      // Setting dates to start from next midnight
      // This job should be configured to run at every 10PM
      let sDate = new Date();
      let eDate = new Date();
      const NUMBER_OF_DAYS_TO_GET_DATA: number = parseInt(
        this.configurationService.get<string>('NUMBER_OF_DAYS_TO_GET_DATA'),
      );
      if (isFirstTimeCalled) {
        sDate.setUTCHours(0, 0, 0);
        data.sDate = sDate.toISOString();
        eDate = new Date(new Date().setUTCHours(23, 59, 59, 59));
        data.eDate = add(eDate, {
          days: NUMBER_OF_DAYS_TO_GET_DATA,
        }).toISOString();
      } else {
        sDate = add(new Date(new Date().setUTCHours(0, 0, 0, 0)), {
          days: NUMBER_OF_DAYS_TO_GET_DATA,
        });
        data.sDate = sDate.toISOString();
        eDate = add(new Date(new Date().setUTCHours(23, 59, 59, 0)), {
          days: NUMBER_OF_DAYS_TO_GET_DATA,
        });
        data.eDate = eDate.toISOString();
      }
      console.log(Math.abs(moment(data.sDate).diff(data.eDate, 'days')));
      console.log(
        `Getting data for channel: ${data.cId} from ${data.sDate} to ${data.eDate}`,
      );
      const re = new RegExp(Object.keys(data).join('|'), 'gi');
      const url = Constants.CHANNEL_SCHEDULE_URL.replace(
        re,
        (matched) => data[matched],
      );
      try {
        const result = await this.axios.get({
          endpoint: url,
        });
        resolve(result);
      } catch (e) {
        // TODO: Error logging
        reject(e);
      }
    });
  }

  /**
   * It will be mapping API response into our mongoDB friendly schema.
   * @Params assetScheduleResponse it is schedule's API response.
   * @Returns scheduleDTOs it is the mapped response.
   */
  private mapAPIScheduleAPIResponse(
    assetScheduleResponse: any[],
    channel: ChannelDTO,
  ): AssetScheduleDTO[] {
    let scheduleDTOs: AssetScheduleDTO[] = [];
    let scheduleDTO: AssetScheduleDTO = null;
    let isAssetImageAvailable: boolean = false;
    for (let response of assetScheduleResponse) {
      scheduleDTO = new AssetScheduleDTO();
      scheduleDTO.channelId = channel.Id;
      scheduleDTO.scheduleId = response.id;
      scheduleDTO.assetId = response.asset?.id;
      scheduleDTO.title = response.title;
      scheduleDTO.duration = response.duration || response.estimatedDuration;
      scheduleDTO.startDate = response.dateTime;
      scheduleDTO.endDate = moment(response.dateTime)
        .add(
          parseInt(response.duration || response.estimatedDuration),
          'minutes',
        )
        .format(Constants.UTC_STRING_FORMAT);
      scheduleDTO.category = response.asset?.category as AssetCategoryDTO[];
      scheduleDTO.type = response.asset?.type;

      //Checking if type is episode then we will check if it's season or not other wise we won't check.
      if (response.asset?.type === 'episode') {
        scheduleDTO.episodeNumber = response.asset?.number;

        //Now checking for associated season..
        for (let related of response.asset?.related) {
          if (related.type === 'season') {
            scheduleDTO.seasonNumber = related.number;
            break;
          }
        }
      }

      // Asset Image sometimes come in media and sometimes come in related object..
      // We will pick media first
      for (let media of response.asset?.media) {
        if (media?.rendition?.default?.href) {
          isAssetImageAvailable = true;
          scheduleDTO.image = media.rendition?.default?.href;
          break;
        }
      }

      if (!isAssetImageAvailable) {
        for (let related of response.asset?.related) {
          if (related) {
            if (Array.isArray(related.media)) {
              for (let media of related.media) {
                if (media?.rendition?.default?.href) {
                  isAssetImageAvailable = true;
                  scheduleDTO.image = media.rendition?.default?.href;
                  break;
                }
              }
            } else {
              if (related.media?.rendition?.default?.href) {
                isAssetImageAvailable = true;
                scheduleDTO.image = related.media?.rendition?.default?.href;
              }
            }
          }
        }
      }

      if (!isAssetImageAvailable) {
        // Assign N/A image to this asset
        scheduleDTO.image = this.configurationService.get<string>(
          'NOT_AVAILABLE_ASSET_IMAGE_URL',
        );
        isAssetImageAvailable = true;
      }

      isAssetImageAvailable = false;
      scheduleDTO.summary = response.asset?.summary;
      scheduleDTO.channelLogo = channel.logo;
      scheduleDTO.channelTitle = channel.title;
      scheduleDTO.platforms = channel.platforms as PlatformDTO[];
      scheduleDTOs.push(scheduleDTO);
    }
    return scheduleDTOs;
  }

  /**
   * This method is responsible to Store Channel and Schedule's data in mongoDB.
   * @params assetSchedules this will be the mapped asset schedules from the API and will be inserted into our DB for further processing.
   */
  private async storeSchedulesInDB(assetSchedules: AssetScheduleDTO[]) {
    return await this.scheduleService.CreateSchedule(assetSchedules);
  }

  /**
   * This method will process each channel one-by-one and grab their schedules.
   * @param channels These are the channels which will be processed to grab their schedules from press-association.
   * @returns list of successfull channels those are processed.
   */

  private async *processAssetScheduleGenerator(
    channel: ChannelDTO,
    IsJobRunForFirstTime: boolean,
  ) {
    try {
      console.log(
        `starting schedules fetching of channel ${channel.Id} name: ${
          channel.title
        } at ${new Date()}`,
      );
      yield this.processChannelsAssetScheduleOneByOne(
        channel,
        IsJobRunForFirstTime,
      );
    } catch (e) {
      console.log(`channel get failed: ${channel.Id} name: ${channel.title}`);
      console.log(e);
    }
  }

  private async processChannelsAssetScheduleOneByOne(
    channel: ChannelDTO,
    isJobRunFirstTIme: boolean,
  ): Promise<AssetScheduleDTO[]> {
    return new Promise(async (resolve, reject) => {
      // It's the channel's asset schedule response in a mapped form so it will be inserted in our DB as it is.
      let assetMappedResponse: AssetScheduleDTO[] = [];

      //Store data after mapping response from API
      let apiMappedResponse: AssetScheduleDTO[] = [];
      try {
        if (channel.Id) {
          let channelAssetScheduleResponse =
            await this.fetchChannelAndItsScheduleBasedOnInterval(
              channel.Id,
              isJobRunFirstTIme,
            );
          if (channelAssetScheduleResponse?.item?.length) {
            apiMappedResponse = this.mapAPIScheduleAPIResponse(
              channelAssetScheduleResponse?.item,
              channel,
            );
            assetMappedResponse.push(...apiMappedResponse);
            resolve(assetMappedResponse);
          }
        }
      } catch (e) {
        console.log(
          `Error while fetching channels schedules ${channel.Id} name: ${channel.title}`,
        );
        console.log('Error Detail: ');
        console.log(e);
        console.log('\n');
        reject([]);
      }
    });
  }

  /**
   * It is basically fetching channel's asset's schedules.
   * First time it will fetch the data for all channels for 14 days.
   * Then from next day onwards it will fetch the data for every 15th day from now and will dump that inside our mongoDB.
   */
  public async FetchChannelsAssetsScheduleOneByOne(): Promise<
    ApiResponse<BaseDTO[]>
  > {
    // Grab channels..
    console.log(`Grabbing channels from DB ${new Date()}`);
    const channels = await this.channelService.GetAllChannels();
    console.log(`Grab channels at ${new Date()}`);

    try {
      if (channels.data.length) {
        console.log(`process started: ${new Date()}`);
        let IsJobRunForFirstTime: boolean =
          await this.checkIfJobRunningFirstTime();
        let response: any;
        for (let channel of channels.data) {
          console.log(
            `Going to fetch schedules for channel ${channel.Id} name: ${
              channel.title
            } at ${new Date()}`,
          );
          response = await this.processAssetScheduleGenerator(
            channel,
            IsJobRunForFirstTime,
          ).next();
          console.log(
            `complete schedules fetching of channel ${channel.Id} name: ${
              channel.title
            } at ${new Date()}`,
          );
          console.log(`total schedules fetched: ${response.value.length}`);
          console.log(`starting dumping in DB ${new Date()}`);
          if (!response.done) {
            await this.storeSchedulesInDB(response.value);
            console.log(
              `successfully stored channel schedule: ${channel.Id} title: ${channel.title} record(s) ${response.value.length}`,
            );
          }
        }
        const existingConfig =
          await this.globalConfigurationService.getConfig();
        await this.globalConfigurationService.findReplaceConfig({
          ...existingConfig.data,
          isJobHasBeenRunningFirstTime: false,
        });
        console.log(`Process has been completed ${new Date()}`);
      } else {
        console.log(`No channels found to process at ${new Date()}`);
      }
    } catch (e: any) {
      console.error('Error in main thread of job');
      console.log(e);
    } finally {
      return null;
    }
  }

  private async checkIfJobRunningFirstTime(): Promise<boolean> {
    let IsJobRunForFirstTime: boolean;
    const intervalConfiguration =
      await this.globalConfigurationService.getConfig();
    if (intervalConfiguration.data) {
      IsJobRunForFirstTime =
        intervalConfiguration.data.isJobHasBeenRunningFirstTime;
    } else {
      const config = new GlobalConfigurationDTO();
      config.isJobHasBeenRunningFirstTime = true;
      await this.globalConfigurationService.createConfig(config);
      IsJobRunForFirstTime = true;
    }
    if (IsJobRunForFirstTime) {
      // Delete Existing Data from MongoDB & Elastic Search.
      const currenDate = moment()
        .tz(Constants.TIME_ZONE)
        .format(Constants.UTC_STRING_FORMAT);
      await this.scheduleService.DeleteOldSchedulesFromMongoDB(true, currenDate);
      await this.scheduleService.DeleteOldSchedulesFromElasticSearch(
        true,
        currenDate,
      );
    }
    return IsJobRunForFirstTime;
  }
}
