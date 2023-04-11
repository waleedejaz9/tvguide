import ApiResponse from '@Helper/api-response';
import ResponseHelper from '@Helper/response-helper';
import { ChannelRepository } from '@Repository/channel.repository';
import { HttpStatus, Injectable } from '@nestjs/common';
import { Channel } from '@Entities/channel.entity';
import { ChannelResponseDTO } from '@DTO/channel-response.dto';
import { Mapper } from '@automapper/core';
import { Mapper as MapperToCreate } from '@automapper/types';
import { InjectMapper } from '@automapper/nestjs';
import PlatformService from './platform.service';
import { GlobalConfigurationService } from './global-configuration.service';
import AxiosHelper from '@Helper/axios.helper';
import { BaseDTO } from '@DTO/base.dto';
import { ChannelDTO } from '@DTO/channel.dto';
import { PlatformDTO } from '@DTO/platform.dto';
import PressAssociationAPIResponse from '@Helper/press-association-api-response';
import { RegionDTO } from '@DTO/region.dto';
import { popularChannels } from '../../popular-channel-list.json';
import { ElasticSearchService } from './elastic-search.service';
import Constants from '@Helper/constants';
import { ConfigService } from '@nestjs/config';
import { AssetScheduleDTO } from '@DTO/asset-schedule.dto';
import moment from 'moment-timezone';
import { SingleChannelAssetScheduleResponseDTO } from '@DTO/single-channel-asset-schedules.dto';
import { RedisService } from './redis.service';

/**
 * This service is responsible for handling channel document and its related operations.
 */
@Injectable()
export class ChannelService {
  /**
   * This is constructor which is used to initialize the channel repository..
   */
  constructor(
    @InjectMapper() private readonly mapper: Mapper,
    @InjectMapper() private readonly mapperToCreateEntity: MapperToCreate,
    private channelRepository: ChannelRepository,
    private platformService: PlatformService,
    private globalConfigurationService: GlobalConfigurationService,
    private axios: AxiosHelper,
    private elasticSearchService: ElasticSearchService,
    private configurationService: ConfigService,
    private redisService: RedisService,
  ) {}

  /**
   * Fetch All channels from its collection
   * @returns ApiResponse<ChannelResponseDTO[]>
   */
  public async GetAllChannelsWithSpecificColumns(): Promise<
    ApiResponse<ChannelResponseDTO[]>
  > {
    const result = await this.channelRepository.getAllBySpecifiedColumns({
      Id: 1,
      logo: 1,
      title: 1,
    });
    const channels = this.mapper.mapArray(result, Channel, ChannelResponseDTO);
    return ResponseHelper.CreateResponse<ChannelResponseDTO[]>(
      channels,
      HttpStatus.OK,
    );
  }

  /**
   * @params channelIds[] it is an array of string which will contains the channelIds..
   * @returns ApiResponse<BaseDTO[]>
   */
  public async MapChannelImagesPathBasedOnChannelIds(
    channelIds: string[],
  ): Promise<ApiResponse<BaseDTO[]>> {
    let result = null;
    let response: BaseDTO[] = [];
    for (let channelId of channelIds) {
      // TODO: Ahmed Need to get from environment variables
      result = await this.channelRepository.updateProperty(channelId, {
        logo: '',
        // logo: `${Constants.S3_BUCKET_BASE_URL}${channelId}.webp`,
      });
      response.push({ id: result });
    }
    return ResponseHelper.CreateResponse<BaseDTO[]>(response, HttpStatus.OK);
  }

  /**
   * This method will fetch data from Press association media API and map channel's platform and regions accordingly into
   * our mongoDB collection.
   * @returns newly inserted channel's mongoDB ids
   */

  public async CreateChannels() {
    const platforms = await this.platformService.GetAllPlatforms();
    const mappedChannels = await this.mapChannelsBasedOnPlatformsAndRegion(
      platforms.data,
    );
    const channels = this.mapperToCreateEntity.mapArray(
      mappedChannels.data,
      Channel,
      ChannelDTO,
    );
    //Getting GlobalConfiguration To Check whether channel is going to create first time or not.
    const globalConfig = await this.globalConfigurationService.getConfig();
    if (!globalConfig || !globalConfig?.data?.isChannelDataExists) {
      //It means we are going to create channels first time.. Remove any garbadge data if previously inserted.
      const removed = await this.channelRepository.deleteMany({});
      // TODO: Logging..
      console.log(`channels removed count: ${removed}`);
    }

    let filterArray = [];

    for (let channel of mappedChannels.data) {
      filterArray.push({ Id: channel.Id });
    }

    let response: BaseDTO[] = null;
    if (channels.length > 0) {
      response = await this.channelRepository.insertIfNotExistsElseUpdate(
        channels,
        filterArray,
      );
      //Updating the Global Configuration..
      await this.globalConfigurationService.findReplaceConfig({
        ...globalConfig.data,
        isChannelDataExists: true,
      });
    }

    return ResponseHelper.CreateResponse<BaseDTO[]>(
      response,
      response ? HttpStatus.CREATED : HttpStatus.EXPECTATION_FAILED,
    );
  }

  /**
   * Fetch All channels from the collections
   * @returns ApiResponse<ChannelDto[]>
   */
  public async GetAllChannels(): Promise<ApiResponse<ChannelDTO[]>> {
    const data = await this.channelRepository.getAllChannels();
    let result = this.mapper.mapArray(data, Channel, ChannelDTO);
    return ResponseHelper.CreateResponse<ChannelDTO[]>(result, HttpStatus.OK);
  }

  /**
   * Fetch All channels from the collections based on region
   * @returns ApiResponse<ChannelDTO[]>
   */
  public async GetAllChannelsByRegion(
    region: string,
  ): Promise<ApiResponse<ChannelResponseDTO[]>> {
    const data = await this.channelRepository.getAllBySpecifiedColumns(
      {
        Id: 1,
        logo: 1,
        title: 1,
      },
      { 'platforms.regions.regionName': region },
    );
    let result = this.mapper.mapArray(data, Channel, ChannelResponseDTO);
    return ResponseHelper.CreateResponse<ChannelResponseDTO[]>(
      result,
      HttpStatus.OK,
    );
  }

  /**
   * Fetch All channels from the collections based on current platform
   * @param platformId It is the currently selected platform.
   * @returns ApiResponse<ChannelDTO[]>
   */
  public async GetAllChannelIdsByPlatform(
    platformId: string,
  ): Promise<ApiResponse<ChannelDTO[]>> {
    const data = await this.channelRepository.getAllChannelIdsByPlatform(
      platformId,
    );
    let result = this.mapper.mapArray(data, Channel, ChannelDTO);
    return ResponseHelper.CreateResponse<ChannelDTO[]>(result, HttpStatus.OK);
  }

  /**   * This method will fetch channels based on the platforms and regions from Press Association Media API
   * @param platforms all platforms stored in our mongoDB.
   * @returns ChannelDTO[] this will contains all channels with their platforms and regions.
   */
  private async mapChannelsBasedOnPlatformsAndRegion(
    platforms: PlatformDTO[],
  ): Promise<ApiResponse<ChannelDTO[]>> {
    let channelResponses = [];
    let finalChannels: ChannelDTO[] = [];
    console.log(
      `Start Grabbing of channels based on platforms and regions: ${new Date()}`,
    );
    if (!platforms.length) {
      console.log(`No platform has been found. Existing this process..`);
      return ResponseHelper.CreateResponse<ChannelDTO[]>([], HttpStatus.OK);
    }
    for (let platform of platforms) {
      //Excluding the popular platform. we just add it for display
      if (
        platform.platformName === Constants.POPULAR_PLATFORM_TITLE ||
        platform.platformName === Constants.MY_CHANNEL_PLATFORM_TITLE
      )
        continue;
      for (let region of platform.regions) {
        const result = await this.axios.get<PressAssociationAPIResponse<any>>({
          endpoint: `/channel?platformId=${platform.platformId}&regionId=${
            region.regionId
          }&date=${new Date()}`,
        });
        for (let item of result.item) {
          //TODO: Refactoring required.
          if (item.media?.length) {
            for (let media of item.media) {
              // Fetching first non-empty logo element
              if (media.rendition?.default?.href) {
                channelResponses.push({
                  channelId: item.id,
                  channelName: item.title,
                  category: item.category,
                  channelLogo: media.rendition?.default?.href,
                  platformId: platform.platformId,
                  platformName: platform.platformName,
                  regionId: region.regionId,
                  regionName: region.regionName,
                  epg: item.epg[0],
                });
              }
              break;
            }
          } else {
            channelResponses.push({
              channelId: item.id,
              channelName: item.title,
              category: item.category,
              channelLogo: this.configurationService.get<string>(
                'NOT_AVAILABLE_ASSET_IMAGE_URL',
              ),
              platformId: platform.platformId,
              platformName: platform.platformName,
              regionId: region.regionId,
              regionName: region.regionName,
              epg: item.epg[0],
            });
          }
        }
      }
    }
    console.log(
      `End Grabbing of channels based on platforms and regions: ${new Date()}`,
    );
    // Now we have all the channels with their associated platforms and region..
    channelResponses.sort(
      (a, b) =>
        a.channelId.localeCompare(b.channelId) ||
        a.platformId.localeCompare(b.platformId),
    );
    let prevChannelId = channelResponses[0].channelId;
    let prevPlatformId = channelResponses[0].platformId;
    let channelRegions: RegionDTO[] = [];
    let channelPlatforms: PlatformDTO[] = [];
    let prevPlatform: PlatformDTO = null;
    let prevChannel = null;
    console.log(
      `Start Preparing of channels based on platforms and regions: ${new Date()}`,
    );

    const key = 'channelId';

    const uniqueChannels = [
      ...new Map(channelResponses.map((item) => [item[key], item])).values(),
    ];
    for (let channel of uniqueChannels) {
      for (let platform of platforms) {
        if (
          platform.platformName === Constants.POPULAR_PLATFORM_TITLE ||
          platform.platformName === Constants.MY_CHANNEL_PLATFORM_TITLE
        )
          continue;
        const res = channelResponses.filter(
          (cr) =>
            cr.channelId === channel.channelId &&
            cr.platformId === platform.platformId,
        );
        if (res && Array.isArray(res)) {
          for (let region of res) {
            channelRegions.push({
              regionId: region.regionId,
              regionName: region.regionName,
            });
          }
        }
        if (res?.length) {
          channelPlatforms.push({
            platformId: platform.platformId,
            platformName: platform.platformName,
            epgNumber: parseInt(res[0].epg),
            regions: channelRegions,
          });
        }
        channelRegions = [];
      }
      finalChannels.push({
        Id: channel.channelId,
        title: channel.channelName,
        categories: channel.category,
        logo: channel.channelLogo,
        platforms: channelPlatforms,
      });
      channelPlatforms = [];
    }

    //Now mapping "Popular channels"
    if (finalChannels.length) {
      let existingChannel = null;
      for (let channel of popularChannels) {
        existingChannel =
          finalChannels.find((fc) => fc.Id === channel.channelId) || {};
        if (existingChannel) {
          existingChannel.platforms.push(channel.platforms);
        }
      }
    }

    console.log(
      `End Preparing of channels based on platforms and regions: ${new Date()}`,
    );
    return ResponseHelper.CreateResponse<ChannelDTO[]>(
      finalChannels,
      HttpStatus.OK,
    );
  }

  /**
   * This method will fetch 10 channels from Elastic Search Based On platforms and regions. Region will be hardcoded
   * i.e London for now
   * @params platformId selected platform on front-end
   * @params lastEPGNumber wll be used to fetch data in page wise.
   * @returns List of Channels
   */

  public async GetAllChannelsFromElasticSearch(
    platformId: string,
    lastEPGNumber: number = 0,
    url: string
  ): Promise<ApiResponse<ChannelDTO[]>> {
    //Fetch from cache
    let cache = await this.redisService.getUrlCache(url);
    if(cache){
      //Returning cache
      console.log("Cache found for url:", url);
      return cache;
    }
    let filter = null;
    if (lastEPGNumber == 0) {
      // Fetch first 10 records..
      filter = {
        _source: {
          excludes: [
            '*.platforms.platformName',
            '*.platforms.regions.*',
            '*.categories.*',
            '.__v',
          ],
        },
        size: 10,
        query: {
          bool: {
            must: [
              {
                nested: {
                  path: 'document.platforms',
                  query: {
                    bool: {
                      must: [
                        {
                          terms: {
                            'document.platforms.platformId.keyword': [
                              platformId,
                            ],
                          },
                        },
                        {
                          bool: {
                            filter: [
                              {
                                nested: {
                                  path: 'document.platforms.regions',
                                  query: {
                                    bool: {
                                      must: [
                                        {
                                          terms: {
                                            'document.platforms.regions.regionName.keyword':
                                              ['London'],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                },
                              },
                            ],
                          },
                        },
                      ],
                    },
                  },
                },
              },
            ],
          },
        },
        sort: [
          {
            'document.platforms.epgNumber': {
              order: 'asc',
              mode: 'max',
              nested: {
                path: 'document.platforms',
                filter: {
                  term: {
                    'document.platforms.platformId.keyword': platformId,
                  },
                },
              },
            },
          },
        ],
      };
    } else {
      // Fetch next 10 records..
      filter = {
        _source: {
          excludes: [
            '*.platforms.platformName',
            '*.platforms.regions.*',
            '*.categories.*',
            '.__v',
          ],
        },
        size: 10,
        query: {
          bool: {
            must: [
              {
                nested: {
                  path: 'document.platforms',
                  query: {
                    bool: {
                      must: [
                        {
                          terms: {
                            'document.platforms.platformId.keyword': [
                              platformId,
                            ],
                          },
                        },
                        {
                          bool: {
                            filter: [
                              {
                                nested: {
                                  path: 'document.platforms.regions',
                                  query: {
                                    bool: {
                                      must: [
                                        {
                                          terms: {
                                            'document.platforms.regions.regionName.keyword':
                                              ['London'],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                },
                              },
                            ],
                          },
                        },
                      ],
                    },
                  },
                },
              },
            ],
          },
        },
        sort: [
          {
            'document.platforms.epgNumber': {
              order: 'asc',
              mode: 'max',
              nested: {
                path: 'document.platforms',
                filter: {
                  term: {
                    'document.platforms.platformId.keyword': platformId,
                  },
                },
              },
            },
          },
        ],
        search_after: [lastEPGNumber],
      };
    }

    let countFilter = null;
    countFilter = {
      query: {
        bool: {
          must: [
            {
              nested: {
                path: 'document.platforms',
                query: {
                  bool: {
                    must: [
                      {
                        terms: {
                          'document.platforms.platformId.keyword': [platformId],
                        },
                      },
                      {
                        bool: {
                          filter: [
                            {
                              nested: {
                                path: 'document.platforms.regions',
                                query: {
                                  bool: {
                                    must: [
                                      {
                                        terms: {
                                          'document.platforms.regions.regionName.keyword':
                                            ['London'],
                                        },
                                      },
                                    ],
                                  },
                                },
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              },
            },
          ],
        },
      },
    };
    let result = await this.elasticSearchService.FetchData<ChannelDTO>(
      `channel_dev_index/_search?filter_path=hits.hits._source.document`,
      filter,
    );
    const response = ResponseHelper.CreateResponse<ChannelDTO[]>(result.data);
    let totalRecords = await this.elasticSearchService.GetCount(
      `channel_dev_index/_count`,
      countFilter,
    );
    response.meta.totalRecords = totalRecords.data.count;
    response.statusCode = HttpStatus.OK;

    console.log("Cache saved for url:", url);
    this.redisService.setUrlCache(url, response, 24*60);
    return response;
  }

  /**
   * Search For all assets based on their titles
   * @param channelTitle it's search text used to search assets based on their title.
   * @returns AssetScheduleDTO[] list of matched records.
   */
  public async GetAassetScheduleBasedOnChannelTitle(
    channelTitle: string,
  ): Promise<ApiResponse<SingleChannelAssetScheduleResponseDTO>> {
    let startDate = moment().tz(Constants.TIME_ZONE);
    startDate.set('hours', 0);
    startDate.set('minutes', 0);
    startDate.set('seconds', 0);

    let endDate = moment().tz(Constants.TIME_ZONE);
    endDate.set('hours', 23);
    endDate.set('minutes', 59);
    endDate.set('seconds', 59);

    const query = {
      size: 10000,
      _source: {
        excludes: [
          '*.platforms',
          '*.category',
          '*.__v',
          '*.duration',
          '*.channelId',
          '*.type',
          '*.episodeNumber',
          '*.seasonNumber',
        ],
      },
      query: {
        bool: {
          must: [
            {
              nested: {
                path: 'document',
                query: {
                  bool: {
                    must: [
                      {
                        match: {
                          'document.channelTitle':
                            decodeURIComponent(channelTitle),
                        },
                      },
                    ],
                  },
                },
              },
            },
            {
              nested: {
                path: 'document',
                query: {
                  bool: {
                    must: [
                      {
                        range: {
                          'document.startDate': {
                            gte: startDate.format(Constants.UTC_STRING_FORMAT),
                          },
                        },
                      },
                      {
                        range: {
                          'document.startDate': {
                            lte: endDate.format(Constants.UTC_STRING_FORMAT),
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          ],
        },
      },
      sort: [
        {
          'document.startDate': { order: 'asc', nested: { path: 'document' } },
        },
      ],
    };

    const result = await this.elasticSearchService.FetchData<AssetScheduleDTO>(
      `${Constants.ASSET_SCHEDULE_URL_ELASTIC_SEARCH}/_search`,
      query,
    );
    let response = new SingleChannelAssetScheduleResponseDTO();
    if (result?.data?.length) {
      response.channel.title = result?.data[0].channelTitle;
      response.channel.logo = result?.data[0].channelLogo;
      const data = result.data.map((d) => {
        return {
          assetId: d.assetId,
          scheduleId: d.scheduleId,
          startDate: d.startDate,
          endDate: d.endDate,
          image: d.image,
          title: d.title,
          summary:
            d.summary?.long || d.summary?.medium || d.summary?.short || '',
        };
      });
      response.assetSchedules = data as any;
    }
    return ResponseHelper.CreateResponse<SingleChannelAssetScheduleResponseDTO>(
      response,
      HttpStatus.OK,
    );
  }

  public async listAll(
    offset: string,
    limit: string,
  ): Promise<ApiResponse<any>> {
    const query = {
      "_source": [
          "*.title", "*.Id"
      ],
      "aggs": {
        "agg_title": {
            "nested": {
                "path": "document"
            },
            "aggs": {
                "distinct_title": {
                    "terms": {
                        "field": "document.title.keyword",
                        "size": 10000
                    }
                }
            }
        }
    },
    "from": 0,
    "size": 0
  }
  const result = await this.elasticSearchService.GetSugesstions(
    `channel_dev_index/_search?pretty`,
    query,
  );
  let results = [];
  if(Array.isArray(result?.aggregations?.agg_title?.distinct_title?.buckets) && result?.aggregations?.agg_title?.distinct_title?.buckets.length){
    results = result?.aggregations?.agg_title?.distinct_title?.buckets.map(_obj => {
      return {title: _obj.key}
    }).sort((a, b) => a.title.localeCompare(b.title));
  }
  const total = results.length;
  
  return ResponseHelper.CreateResponse<any>({total, list: results}, HttpStatus.OK);
  }
}
