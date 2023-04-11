import ApiResponse from '@Helper/api-response';
import AssetCategoryService from '@Services/asset-category.service';
import { AssetCategoryListResponseDTO } from '@DTO/asset-category-response-dto';
import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { BaseDTO } from '@DTO/base.dto';
import {Request} from 'express';

@Controller('assetcategory')
export class AssetCategoryController {
  constructor(private readonly assetCategoryService: AssetCategoryService) {}

  /**
   *
   * @returns contains all asset categories list
   */
  @Get('')
  async getAssetCategory(
    @Req() req: Request
  ) {
    let res = await this.assetCategoryService.getAllAssetCategory(req.url);
    return res;
  }
}
