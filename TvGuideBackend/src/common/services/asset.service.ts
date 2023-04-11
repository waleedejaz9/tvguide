import ResponseHelper from '@Helper/response-helper';
import { HttpStatus, Injectable } from '@nestjs/common';
import ApiResponse from '@Helper/api-response';
import { ScheduleService } from './schedule.service';
import { AssetScheduleDTO } from '@DTO/asset-schedule.dto';
import { AssetSchedulesWithSeasonsEpisodesDTO } from '@DTO/asset-schedules-with-seaons-episodes.dto';
import moment from 'moment';
import Constants from '@Helper/constants';
import { ElasticSearchService } from './elastic-search.service';
import { ConfigService } from '@nestjs/config';

/**
 * This service is responsible for handling asset (program) document and its related operations.
 */
@Injectable()
export class AssetService {
  /**
   * This is constructor which is used to initialize the asset repository..
   */
  constructor(
    private scheduleService: ScheduleService,
    private elasticSearchService: ElasticSearchService,
    private configurationService: ConfigService,
  ) { }
  /**
   * This method is responsible for fetching asset details from third party api
   * @param assetId currently selected asset Id
   * @returns it will returns the total asset details against the program
   */
  public async GetAssetDetails(
    assetId: string,
    scheduleId: string,
  ): Promise<ApiResponse<AssetScheduleDTO>> {
    try {
      let response = await this.scheduleService.GetAssetSchedule(
        assetId,
        scheduleId,
      );
      if (response) {
        return ResponseHelper.CreateResponse<AssetScheduleDTO>(
          response.data,
          HttpStatus.OK,
        );
      } else {
        return ResponseHelper.CreateResponse<AssetScheduleDTO>(
          null,
          HttpStatus.NOT_FOUND,
        );
      }
    } catch (e) {
      return ResponseHelper.CreateResponse<AssetScheduleDTO>(
        null,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get All episodes and their seasons for particular assets
   * @param assetIds[] Asset Ids for fetching particular assets with their associated information...
   * @returns AssetSchedulesWithSeasonsEpisodesDTO[] list of matched records.
   */
  //TODO: need a fix for two endpoints
  public async GetAassetsSchedule(
    assetId: string,
  ): Promise<ApiResponse<AssetSchedulesWithSeasonsEpisodesDTO[]>> {
    let date = moment().utc().set("hours", 0).set("minutes", 0).set("seconds", 0).format(Constants.UTC_STRING_FORMAT);
    
    const query = {
      size: 10000,
      _source: {
        excludes: [
          '*.__v',
          '*.category',
          '*.duration',
          '*.endDate',
          '*.platforms',
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
                        terms: {
                          'document.assetId.keyword': [assetId]
                        },
                      },
                      {
                        range: {
                          'document.startDate': {
                            gte: date,
                          },
                        },
                      },
                      // {
                      //   range: {
                      //     'document.endDate': {
                      //       lte: moment
                      //         .utc()
                      //         .add(
                      //           this.configurationService.get<number>(
                      //             'NUMBER_OF_DAYS_TO_GET_DATA',
                      //           ),
                      //           'days',
                      //         )
                      //         .format(Constants.UTC_STRING_FORMAT),
                      //     },
                      //   },
                      // },
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
      `${Constants.ASSET_SCHEDULE_URL_ELASTIC_SEARCH}/_search?filter_path=hits.hits._source.document`,
      query,
    );
    let response: AssetSchedulesWithSeasonsEpisodesDTO[] = [];
    if (result?.data?.length) {
      let asset = null;
      let assetInformation = new AssetSchedulesWithSeasonsEpisodesDTO();
      asset = result.data.filter((d) => d.assetId === assetId);
      assetInformation.assetId = asset[0].assetId;
      assetInformation.title = asset[0].title;
      assetInformation.image = asset[0].image;
      assetInformation.description =
        asset[0].summary?.long ||
        asset[0].summary?.medium ||
        asset[0].summary?.short ||
        '';
      const data = asset.map((d) => {
        return {
          scheduleId: d.scheduleId,
          startDate: d.startDate,
          seasonNumber: d.seasonNumber,
          episodeNumber: d.episodeNumber,
          type: d.type,
          channelLogo: d.channelLogo,
          channelId: d.channelId,
          channelTitle: d.channelTitle,
        };
      });
      assetInformation.assetSeasons = data as any;
      response.push(assetInformation);

    }
    return ResponseHelper.CreateResponse<
      AssetSchedulesWithSeasonsEpisodesDTO[]
    >(response, HttpStatus.OK);
  }
}
