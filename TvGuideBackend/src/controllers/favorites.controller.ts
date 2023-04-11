import { FavoritesDTO } from '@DTO/favorites.dto';
import ApiResponse from '@Helper/api-response';
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
import { FavoriteService } from '@Services/favorites.service';
// import AssetService from '@Service/asset.service';
@Controller('favoriteAsset')
export class FavoritesController {
  constructor(private readonly favoriteService: FavoriteService) { }

  /**
   * @param assetId currently selected asset
   * @returns contains asset details from our mongo DB
   */
  @Post('/favorites')
  public async CreateFavorites(
    @Body() @Query('userId') favoriteChannels: FavoritesDTO,
    userId: string,
  ) {
    let response = await this.favoriteService.CreateFavoritesAsset(
      userId,
      favoriteChannels,
    );
    return response;
  }

  /**
   * @param userId currently selected user
   * @returns contains asset details from our mongo DB and fetch their detailed information from elastic search.
   */
  @Get('/getFavorites/:userId')
  public async GetFavoritesAsset(@Param('userId') userId: string) {
    console.log("checking getFavorites")
    let response = await this.favoriteService.GetFavoritesAsset(userId);
    return response;
  }

  /**
 * @param assetId currently selected asset
 * @returns contains asset details from our mongo DB and fetch their detailed information from elastic search.
 */
  @Get('/getFavoriteShowDetails/:assetId')
  public async getFavoriteShowDetails(@Param('assetId') assetId: string) {
    let response = await this.favoriteService.getFavoriteShowDetails(assetId);
    return response;
  }

  @Get('/checkUserFavorite')
  public async CheckUserFavorite(
    @Query('userId') userId: string,
    @Query('assetId') assetId: string,
  ) {
    let response = await this.favoriteService.CheckFavoritesAsset(
      userId,
      assetId,
    );
    return response;
  }

  @Put('/updateUserFavorite')
  public async UpdateUserFavorite(
    @Query('userId') userId: string,
    @Body() favoritesChannel: FavoritesDTO,
  ) {
    let response = await this.favoriteService.UpdateUserFavorite(
      userId,
      favoritesChannel,
    );
    return response;
  }

  /**
   * @returns deletes channel List in my channel collection in mongo db
   */
  @Delete()
  public async DeleteFavorite(
    @Query('userId') userId: string,
    @Body() favoritesAsset: [],
  ): Promise<ApiResponse<string>> {
    let response = await this.favoriteService.DeleteFavorite(
      userId,
      favoritesAsset,
    );
    console.log(response)
    return response;
  }
}
