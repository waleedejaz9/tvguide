import { Controller, Get, Req } from '@nestjs/common';
import { RegionService } from '@Services/region.service';
import {Request} from 'express';

@Controller('region')
export class RegionController {
  constructor(private readonly regionService: RegionService) {}

  /** method fetches all regions.
   * @returns returns all regions
   */
  @Get('/getAll')
  async GetRegions(
    @Req() req: Request
  ) {
    let res = await this.regionService.getAllRegions(req.url);
    return res;
  }

  @Get('/seed')
  public async SeedRegions() {
    return await this.regionService.CreateRegions();
  }
}
