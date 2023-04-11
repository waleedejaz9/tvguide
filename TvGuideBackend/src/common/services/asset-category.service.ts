import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/types';
import ResponseHelper from '@Helper/response-helper';
import {
  AssetCategory,
  AssetCategoryDocument,
} from '@Entities/asset-category.entity';
import { HttpStatus, Injectable } from '@nestjs/common';
import { AssetCategoryRepository } from '@Repository/asset-category.repository';
import ApiResponse from '@Helper/api-response';
import { AssetCategoryListResponseDTO } from '@DTO/asset-category-response-dto';
import { RedisService } from './redis.service';

@Injectable()
export default class AssetCategoryService {
  /**
   * Service to fetch asset category list
   */
  constructor(
    @InjectMapper() private readonly mapper: Mapper,
    private readonly assetCategoryRepository: AssetCategoryRepository,
    private redisService: RedisService,
  ) {}

  // TOOD: Comment
  /**
   *
   * @returns
   */
  async getAllAssetCategory(url: string): Promise<
    ApiResponse<AssetCategoryListResponseDTO[]>
  > {
    //Fetch from cache
    let cache = await this.redisService.getUrlCache(url);
    if(cache){
      //Returning cache
      console.log("Cache found for url:", url);
      return ResponseHelper.CreateResponse<AssetCategoryListResponseDTO[]>(
        cache,
        HttpStatus.OK,
      );;
    }
    let data = await this.assetCategoryRepository.getAll();
    data = data.sort((a,b) => Number(a._id)-Number(b._id));
    let result = this.mapper.mapArray(
      data,
      AssetCategory,
      AssetCategoryListResponseDTO,
    );
    console.log("Cache saved for url:", url);
    this.redisService.setUrlCache(url, result, 24*60);
    return ResponseHelper.CreateResponse<AssetCategoryListResponseDTO[]>(
      result,
      HttpStatus.OK,
    );
  }
}
