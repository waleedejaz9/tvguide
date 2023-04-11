import { ScheduleRepository } from '@Repository/schedule.repository';
import { HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { AssetScheduleDTO } from '@DTO/asset-schedule.dto';
import ApiResponse from '@Helper/api-response';
import { BaseDTO } from '@DTO/base.dto';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { Mapper as MapperToCreate } from '@automapper/types';
import { Schedule } from '@Entities/schedule.entity';
import ResponseHelper from '@Helper/response-helper';
import { ElasticSearchService } from './elastic-search.service';
import { ChannelAssetScheduleDTO } from '@DTO/channel-asset-schedule.dto';
import { AssetScheduleRequestDTO } from '@DTO/asset-schedule-request.dto';
import { ChannelService } from './channel.service';
import { ChannelAssetScheduleResponseDTO } from '@DTO/channel-asset-schedule-response.dto';
import moment from 'moment-timezone';
import { CommonFunctions } from '../utils/common-functions';
import Constants from '@Helper/constants';
import { ConfigService } from '@nestjs/config';
import { CronJob } from 'cron';
import { SchedulerRegistry } from '@nestjs/schedule';
import { RedisService } from './redis.service';

/**
 * This service is responsible for handling asset (program) document and its related operations.
 */
@Injectable()
export class ScheduleService implements OnModuleInit {
  /**
   * This is constructor which is used to initialize the schedule repository..
   */
  // During the mapping this library is trying to create instance for the mongoDB document which is prohibitted so that's why just for type inference
  // Importing other mapper module from the same library
  constructor(
    @InjectMapper() private readonly mapper: Mapper,
    @InjectMapper() private readonly mapperToCreateEntity: MapperToCreate,
    private scheduleRepository: ScheduleRepository,
    private elasticSearchService: ElasticSearchService,
    private redisService: RedisService,
    private configurationService: ConfigService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}
  onModuleInit() {
    const job = new CronJob(
      this.configurationService.get<string>('CRON_EXPR_DELETE_LAST_RECORD'),
      async () => {
        try {
          console.log('In schedular job');
          await this.DeleteOldSchedulesFromMongoDB();
          await this.DeleteOldSchedulesFromElasticSearch();
          console.log('end schedular job');
        } catch (e) {
          console.log(e);
        }
      },
    );
    this.schedulerRegistry.addCronJob(`REMOVE PROGRAM'S SCHEDULES`, job);
    job.start();
  }
  /**
   * @param schedules these are the multiple assets schedules based on particular platform..
   * @returns it will return the ids of newly created items in DB.s
   */
  public async CreateSchedule(
    schedules: AssetScheduleDTO[],
  ): Promise<ApiResponse<BaseDTO[]>> {
    console.log('total schedules ' + schedules.length);
    try {
      let entities = this.mapperToCreateEntity.mapArray(
        schedules,
        Schedule,
        AssetScheduleDTO,
      );
      let result = await this.scheduleRepository.createMultiple(entities);
      return ResponseHelper.CreateResponse<BaseDTO[]>(
        result,
        HttpStatus.CREATED,
      );
    } catch (e) {
      return ResponseHelper.CreateResponse<any>(
        e,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Delete Delete Old Schedules From MongoDB
   * @returns true/false whether this operation is successfull or not.
   */
  public async DeleteOldSchedulesFromMongoDB(
    removeAll: boolean = false,
    date?: string,
  ): Promise<ApiResponse<number>> {
    let startDate = moment()
      .add(-1, 'days')
      .set('hours', 23)
      .set('minutes', 59)
      .set('seconds', 59)
      .utc()
      .format(Constants.UTC_STRING_FORMAT);
    if (date) {
      console.log(
        'passed date: ' +
          moment(date)
            .add(-1, 'days')
            .set('hours', 23)
            .set('minutes', 59)
            .set('seconds', 59)
            .utc()
            .format(Constants.UTC_STRING_FORMAT),
      );
      const numberOfDaysToFetchData = this.configurationService.get<number>(
        'NUMBER_OF_DAYS_TO_GET_DATA',
      );
      if (removeAll) {
        startDate = moment(date)
          .add(numberOfDaysToFetchData + 1, 'days')
          .format(Constants.UTC_STRING_FORMAT);
      } else {
        startDate = moment(date).format(Constants.UTC_STRING_FORMAT);
      }
    }
    console.log(`Removing Old Schedule Data less than ${startDate}`);
    const response = await this.scheduleRepository.deleteMany({
      $and: [
        {
          startDate: {
            $lte: startDate,
          },
        },
      ],
    });
    console.log('MongoDB Delete query response: ');
    console.log(response);
    return ResponseHelper.CreateResponse<number>(response, HttpStatus.OK);
  }

  /**
   * This method is responsible for fetching data of schedules against an asset from our MongoDB.
   * @param assetId it is the unique id of a partcular asset
   * @returns ApiResponse<AssetScheduleDTO> It will return the asset schedule from our MongoDB
   *  wrapped inside ApiResponse to maintain generic response
   */
  public async GetAssetSchedule(
    assetId: string,
    scheduleId: string,
  ): Promise<ApiResponse<AssetScheduleDTO>> {
    try {
      const result = await this.scheduleRepository.GetAssetSchedule({
        assetId: assetId,
        scheduleId: scheduleId,
      });
      const response = this.mapper.map(result, Schedule, AssetScheduleDTO);
      if (response) {
        return ResponseHelper.CreateResponse<AssetScheduleDTO>(
          response,
          HttpStatus.OK,
        );
      } else {
        return ResponseHelper.CreateResponse<AssetScheduleDTO>(
          null,
          HttpStatus.NOT_FOUND,
        );
      }
    } catch (e) {
      console.log(e);
      return ResponseHelper.CreateResponse<AssetScheduleDTO>(
        null,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * This method is responsible for fetching schedule's of assets from elastic search.
   * @params filters this contains the object coming from front-end / UI for selected filters. i.e channels, date/time etc.
   * @returns ChannelAssetScheduleResponseDTO it's the specialized object[] which is used to bind front-end asset schedule time
   * listing control
   */
  public async GetAssetsSchedules(
    nfilters: AssetScheduleRequestDTO,
    url: string
  ): Promise<ApiResponse<ChannelAssetScheduleResponseDTO[]>> {
    try {
      //Fetch from cache
      let cache = await this.redisService.getUrlCache(url);
      if(cache){
        //Returning cache
        console.log("Cache found for url:", url);
        return cache;
      }
      //Elastic Search Client should be used here.
      let query = null;
      const sD = moment(nfilters.selectedStartDateTime.replace(' ', '+'))
        .utc()
        .set('seconds', 0)
        .format(Constants.UTC_STRING_FORMAT);
      const eD = moment(nfilters.selectedEndDateTime.replace(' ', '+'))
        .utc()
        .add(1, 'day')
        .set('seconds', 0)
        .format(Constants.UTC_STRING_FORMAT);
      let dateS = moment(sD).utc().format('YYYY-MM-DD');
      let dateE = moment(eD).utc().format('YYYY-MM-DD');
      const excludedFields = [
        '*.platforms.platformName',
        '*.platforms.regions.*',
        '*.category.*',
        '*.__v',
        '*.channelLogo',
        '*.type',
        '*.episodeNumber',
        '*.seasonNumber',
      ];
      if (nfilters.platformId === 'c101') {
        if (
          !nfilters.category ||
          nfilters.category === Constants.DEFAULT_GENRE
        ) {
          query = {
            _source: {
              excludes: excludedFields,
            },
            size: 10000,
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
                              terms: {
                                'document.channelId.keyword':
                                  nfilters.channelIds,
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
                                  gte: dateS,
                                },
                              },
                            },
                            {
                              range: {
                                'document.endDate': {
                                  lte: dateE,
                                },
                              },
                            },
                          ],
                          must_not: [
                            {
                              range: {
                                'document.startDate': {
                                  gte: eD,
                                },
                              },
                            },
                            {
                              range: {
                                'document.endDate': {
                                  lte: sD,
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
                'document.startDate': {
                  order: 'asc',
                  nested: { path: 'document' },
                },
              },
            ],
          };
        } else if (nfilters.category !== 'film') {
          query = {
            _source: {
              excludes: excludedFields,
            },
            size: 10000,
            query: {
              bool: {
                must: [
                  {
                    nested: {
                      path: 'document.category',
                      query: {
                        bool: {
                          must: [
                            {
                              terms: {
                                'document.category.code.keyword': [
                                  nfilters.category,
                                ],
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
                              terms: {
                                'document.channelId.keyword':
                                  nfilters.channelIds,
                              },
                            },
                            {
                              range: {
                                'document.startDate': {
                                  gte: dateS,
                                },
                              },
                            },
                            {
                              range: {
                                'document.endDate': {
                                  lte: dateE,
                                },
                              },
                            },
                          ],
                          must_not: [
                            {
                              range: {
                                'document.startDate': {
                                  gte: eD,
                                },
                              },
                            },
                            {
                              range: {
                                'document.endDate': {
                                  lte: sD,
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
                'document.startDate': {
                  order: 'asc',
                  nested: { path: 'document' },
                },
              },
            ],
          };
        } else if (nfilters.category === 'film') {
          query = {
            _source: {
              excludes: excludedFields,
            },
            size: 10000,
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
                              terms: {
                                'document.type.keyword': ['movie'],
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
                              terms: {
                                'document.channelId.keyword':
                                  nfilters.channelIds,
                              },
                            },
                            {
                              range: {
                                'document.startDate': {
                                  gte: dateS,
                                },
                              },
                            },
                            {
                              range: {
                                'document.endDate': {
                                  lte: dateE,
                                },
                              },
                            },
                          ],
                          must_not: [
                            {
                              range: {
                                'document.startDate': {
                                  gte: eD,
                                },
                              },
                            },
                            {
                              range: {
                                'document.endDate': {
                                  lte: sD,
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
                'document.startDate': {
                  order: 'asc',
                  nested: { path: 'document' },
                },
              },
            ],
          };
        }
      } else if (
        !nfilters.category ||
        nfilters.category === Constants.DEFAULT_GENRE
      ) {
        query = {
          _source: {
            excludes: excludedFields,
          },
          size: 10000,
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
                            terms: {
                              'document.channelId.keyword': nfilters.channelIds,
                            },
                          },
                        ],
                      },
                    },
                  },
                },
                {
                  nested: {
                    path: 'document.platforms',
                    query: {
                      bool: {
                        must: [
                          {
                            terms: {
                              'document.platforms.platformId.keyword': [
                                nfilters.platformId,
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
                {
                  nested: {
                    path: 'document',
                    query: {
                      bool: {
                        must: [
                          {
                            range: {
                              'document.startDate': {
                                gte: dateS,
                              },
                            },
                          },
                          {
                            range: {
                              'document.endDate': {
                                lte: dateE,
                              },
                            },
                          },
                        ],
                        must_not: [
                          {
                            range: {
                              'document.startDate': {
                                gte: eD,
                              },
                            },
                          },
                          {
                            range: {
                              'document.endDate': {
                                lte: sD,
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
              'document.platforms.epgNumber': {
                order: 'asc',
                mode: 'max',
                nested: {
                  path: 'document.platforms',
                  filter: {
                    term: {
                      'document.platforms.platformId.keyword':
                        nfilters.platformId,
                    },
                  },
                },
              },
              'document.startDate': {
                order: 'asc',
                nested: { path: 'document' },
              },
            },
          ],
        };
      } else if (nfilters.category !== 'film') {
        query = {
          _source: {
            excludes: excludedFields,
          },
          size: 10000,
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
                                nfilters.platformId,
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
                {
                  nested: {
                    path: 'document.category',
                    query: {
                      bool: {
                        must: [
                          {
                            terms: {
                              'document.category.code.keyword': [
                                nfilters.category,
                              ],
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
                            terms: {
                              'document.channelId.keyword': nfilters.channelIds,
                            },
                          },
                          {
                            range: {
                              'document.startDate': {
                                gte: dateS,
                              },
                            },
                          },
                          {
                            range: {
                              'document.endDate': {
                                lte: dateE,
                              },
                            },
                          },
                        ],
                        must_not: [
                          {
                            range: {
                              'document.startDate': {
                                gte: eD,
                              },
                            },
                          },
                          {
                            range: {
                              'document.endDate': {
                                lte: sD,
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
              'document.platforms.epgNumber': {
                order: 'asc',
                mode: 'max',
                nested: {
                  path: 'document.platforms',
                  filter: {
                    term: {
                      'document.platforms.platformId.keyword':
                        nfilters.platformId,
                    },
                  },
                },
              },
              'document.startDate': {
                order: 'asc',
                nested: { path: 'document' },
              },
            },
          ],
        };
      } else if (nfilters.category === 'film') {
        query = {
          _source: {
            excludes: excludedFields,
          },
          size: 10000,
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
                                nfilters.platformId,
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
                {
                  nested: {
                    path: 'document',
                    query: {
                      bool: {
                        must: [
                          {
                            terms: {
                              'document.type.keyword': ['movie'],
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
                            terms: {
                              'document.channelId.keyword': nfilters.channelIds,
                            },
                          },
                          {
                            range: {
                              'document.startDate': {
                                gte: dateS,
                              },
                            },
                          },
                          {
                            range: {
                              'document.endDate': {
                                lte: dateE,
                              },
                            },
                          },
                        ],
                        must_not: [
                          {
                            range: {
                              'document.startDate': {
                                gte: eD,
                              },
                            },
                          },
                          {
                            range: {
                              'document.endDate': {
                                lte: sD,
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
              'document.platforms.epgNumber': {
                order: 'asc',
                mode: 'max',
                nested: {
                  path: 'document.platforms',
                  filter: {
                    term: {
                      'document.platforms.platformId.keyword':
                        nfilters.platformId,
                    },
                  },
                },
              },
              'document.startDate': {
                order: 'asc',
                nested: { path: 'document' },
              },
            },
          ],
        };
      }
      const startDate = sD;
      const endDate = eD;
      let result =
        await this.elasticSearchService.FetchData<ChannelAssetScheduleDTO>(
          `${Constants.ASSET_SCHEDULE_URL_ELASTIC_SEARCH}/_search?filter_path=hits.hits._source.document`,
          query,
        );

      let response: ChannelAssetScheduleResponseDTO[] = [];
      let difference = null;

      let channelAssets = [];
      let noProgramData = [];
      let finalAssets = [];
      let channelResponse = [];
      for (let channelId of nfilters.channelIds) {
        channelResponse = result.data.filter((r) => r.channelId === channelId);

        for (let data of channelResponse) {
          if (data.startDate === data.endDate) continue;
          channelAssets.push(data);
        }
        let prevStartTime = startDate;
        for (let ch of channelAssets) {
          if (moment(prevStartTime).isBefore(moment(ch.startDate))) {
            difference = Math.abs(
              moment(prevStartTime).diff(moment(ch.startDate), 'minutes'),
            );
            noProgramData.push({
              channelId: channelId,
              title: Constants.NO_SECHEDULER_DATA_TITLE,
              startDate: prevStartTime,
              endDate: ch.startDate,
              duration: difference,
            });
          } else if (moment(ch.startDate).isBefore(moment(prevStartTime))) {
            difference = Math.abs(
              moment(prevStartTime).diff(moment(ch.endDate), 'minutes'),
            );
            ch.duration = difference;
          }
          prevStartTime = ch.endDate;
        }
        finalAssets = channelAssets.concat(noProgramData);
        finalAssets = finalAssets.sort(
          (objA, objB) =>
            moment(objA.startDate).unix() - moment(objB.startDate).unix(),
        );
        if (finalAssets?.length) {
          let lstElem = moment(finalAssets[finalAssets.length - 1].endDate)
            .utc()
            .format(Constants.UTC_STRING_FORMAT);
          let difference = Math.abs(
            moment(lstElem).diff(moment(endDate), 'minutes'),
          );
          if (moment(lstElem).isBefore(endDate)) {
            finalAssets.push({
              channeld: channelId,
              title: Constants.NO_SECHEDULER_DATA_TITLE,
              startDate: lstElem,
              endDate: endDate,
              duration: difference,
            });
          }
        }

        response.push({
          channel: {
            id: channelId,
          },
          assetSchedules: finalAssets,
        });

        noProgramData = [];
        finalAssets = [];
        channelAssets = [];
      }

      const finalResult = ResponseHelper.CreateResponse<
        ChannelAssetScheduleResponseDTO[]
      >(response, HttpStatus.OK);
      console.log("Cache saved for url:", url);
      await this.redisService.setUrlCache(url, finalResult, 10*60);
      return finalResult;
    } catch (e) {
      console.log('comes in error block of schedule');
      console.log(e);
      const finalResult = ResponseHelper.CreateResponse<
        ChannelAssetScheduleResponseDTO[]
      >(null, HttpStatus.BAD_REQUEST);
      return finalResult;
    }
  }

  /**
   * Auto complete search for asset titles in schedule collection
   * @param searchText it's search text used to search assets based on their title.
   * @returns string[] list of matched records.
   */
  public async GetSuggestions(
    searchText: string,
  ): Promise<ApiResponse<string[]>> {
    const query = {
      "_source": [
          "title_adv.crude"
      ],
      "query": {
          "bool": {
              "should": [
                  {
                      "multi_match": {
                          "query": searchText,
                          "type": "bool_prefix",
                          "fields": [
                              "title_adv.suggestion",
                              "title_adv.suggestion._2gram",
                              "title_adv.suggestion._3gram"
                          ],
                          "boost": 5
                      }
                  },
                  {
                      "prefix": {
                          "title_adv.keyword": {
                              "value": searchText,
                              "boost": 10
                          }
                      }
                  },
                  {
                      "fuzzy": {
                          "title_adv.keyword": {
                              "value": searchText,
                              "fuzziness": 0,
                              "prefix_length": 0,
                              "boost": 8
                          }
                      }
                  }
              ]
          }
      },
      "collapse": {
        "field": "title_adv.keyword"
      },
      "from": 0,
      "size": 20,
      "sort": [{"_score": "desc"}, {"title_adv.keyword": "desc"}]
  }
    const result = await this.elasticSearchService.GetSugesstions(
      `${Constants.ASSET_SCHEDULE_URL_ELASTIC_SEARCH}/_search?pretty`,
      query,
    );
    let results = [];
    if(result && result.hits && Array.isArray(result.hits.hits) && result.hits.hits.length){
      results = result.hits.hits.map(_obj => _obj._source["title_adv.crude"]);
    }
    
    return ResponseHelper.CreateResponse<string[]>(results, HttpStatus.OK);
  }

  /**
   * Search For all assets based on their titles
   * @param assetTitle it's search text used to search assets based on their title.
   * @returns AssetScheduleDTO[] list of matched records.
   */
  public async GetAassetScheduleBasedOnItsTitle(
    assetTitle: string,
    lastStartDate: string,
  ): Promise<ApiResponse<AssetScheduleDTO[]>> {
    const nextDate = moment
      .utc(lastStartDate)
      .format(Constants.UTC_STRING_FORMAT);
    let epoch = moment(nextDate).unix().valueOf() / 1000;
    let startDate = moment().tz(Constants.TIME_ZONE);
    startDate.set('hours', 0);
    startDate.set('minutes', 0);
    startDate.set('seconds', 0);
    const numberOfDaysToFetchData = this.configurationService.get<number>(
      'NUMBER_OF_DAYS_TO_GET_DATA',
    );
    let endDate = moment()
      .add(numberOfDaysToFetchData, 'days')
      .tz(Constants.TIME_ZONE);
    endDate.set('hours', 23);
    endDate.set('minutes', 59);
    endDate.set('seconds', 59);
    const query = {
      _source: {
        excludes: [
          '*.platforms',
          '*.summary',
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
                        range: {
                          'document.startDate': {
                            gte: startDate.format(Constants.UTC_STRING_FORMAT),
                          },
                        },
                      },
                      {
                        range: {
                          'document.endDate': {
                            lte: endDate.format(Constants.UTC_STRING_FORMAT),
                          },
                        },
                      },
                      
                    ],
                  },
                },
              },
            },
            {
              "nested": {
                "path": "document.platforms",
                "query": {
                  "bool": {
                    "must": [
                      {
                        "bool": {
                          "filter": [
                            {
                              "nested": {
                                "path": "document.platforms.regions",
                                "query": {
                                  "bool": {
                                    "must": [
                                      {
                                        "terms": {
                                          "document.platforms.regions.regionName.keyword":
                                            ["London"]
                                        }
                                      }
                                    ]
                                  }
                                }
                              }
                            }
                          ]
                        }
                      }
                    ]
                  }
                }
              }
            }
          ],
          should: [
              {
                "match": {
                    "title_adv.keyword": {
                        "query": assetTitle,
                        "operator": "and",
                        "boost": 20,
                        "fuzziness": 1,
                        "zero_terms_query": "all"
                    }
                }
            },
            {
                "match": {
                    "title_adv.searchable": {
                        "query": assetTitle,
                        "operator": "or",
                        "boost": 10,
                        "fuzziness": 1,
                        "zero_terms_query": "all"
                    }
                }
            }
          ]
        },
      },
      "sort": [
          {
              "_score": "desc"
          },
          {
              "document.startDate": {
                  "order": "asc",
                  "nested": {
                      "path": "document"
                  }
              }
          }
      ]
    };
    // console.log(JSON.stringify(query, null,2));
    const result = await this.elasticSearchService.GetSugesstions(
      `${Constants.ASSET_SCHEDULE_URL_ELASTIC_SEARCH}/_search?pretty`,
      query,
    );
    let results: AssetScheduleDTO[] = [];
    if(result && result.hits && Array.isArray(result.hits.hits) && result.hits.hits.length){
      for (let asset of result.hits.hits) {
        results.push(asset._source.document as AssetScheduleDTO);
      }
    }
    return ResponseHelper.CreateResponse<AssetScheduleDTO[]>(
      results,
      HttpStatus.OK,
    );
  }

  /**
   * Delete Delete Old Schedules From Elastic Search
   * @returns true/false whether this operation is successfull or not.
   */
  public async DeleteOldSchedulesFromElasticSearch(
    removeAll: boolean = false,
    date?: string,
  ): Promise<ApiResponse<boolean>> {
    let result = true;
    try {
      let startDate = moment()
        .add(-1, 'days')
        .set('hours', 23)
        .set('minutes', 59)
        .set('seconds', 59)
        .utc()
        .format(Constants.UTC_STRING_FORMAT);
      if (date) {
        console.log(
          'passed date: ' +
            moment(date)
              .add(-1, 'days')
              .set('hours', 23)
              .set('minutes', 59)
              .set('seconds', 59)
              .utc()
              .format(Constants.UTC_STRING_FORMAT),
        );
        const numberOfDaysToFetchData = this.configurationService.get<number>(
          'NUMBER_OF_DAYS_TO_GET_DATA',
        );
        if (removeAll) {
          startDate = moment(date)
            .add(numberOfDaysToFetchData + 1, 'days')
            .format(Constants.UTC_STRING_FORMAT);
        } else {
          startDate = moment(date).format(Constants.UTC_STRING_FORMAT);
        }
      }

      console.log(
        `Elastic - Search: removing Old Schedule Data less than ${startDate}`,
      );
      const filter = {
        query: {
          nested: {
            path: 'document',
            query: {
              bool: {
                must: [
                  {
                    range: {
                      'document.startDate': {
                        lte: startDate,
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      };
      let result = await this.elasticSearchService.Post(
        `${Constants.ASSET_SCHEDULE_URL_ELASTIC_SEARCH}/_delete_by_query`,
        filter,
      );
      console.log('Elastic search delete response');
      console.log(result);
      return ResponseHelper.CreateResponse<boolean>(result, HttpStatus.OK);
    } catch (e) {
      result = false;
      return ResponseHelper.CreateResponse<boolean>(
        result,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async listAll(
    offset: string,
    limit: string,
  ): Promise<ApiResponse<any>> {
    const query = {
      "_source": [
          "title_adv.crude",
          "*.scheduleId",
          "*.channelId",
          "*.assetId",
      ],
      "query": {
          "match_all": {}
      },
      "from": offset,
      "size": limit,
      "sort": [{
        "document.startDate": {
            "order": "asc",
            "nested": {
                "path": "document"
            }
        }
    }]
  }
    const result = await this.elasticSearchService.GetSugesstions(
      `${Constants.ASSET_SCHEDULE_URL_ELASTIC_SEARCH}/_search?pretty`,
      query,
    );
    const total = result.hits.total.value;
    let results = [];
    if(result && result.hits && Array.isArray(result.hits.hits) && result.hits.hits.length){
      results = result.hits.hits.map(_obj => {
        return {..._obj._source.document, title: _obj._source["title_adv.crude"]}
      });
    }
    
    return ResponseHelper.CreateResponse<any>({total, list: results}, HttpStatus.OK);
  }
}
