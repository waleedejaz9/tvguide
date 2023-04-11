import ApiResponse from '@Helper/api-response';
import RatingService from '@Services/rating.service';
import { ProgramRatingRequestDTO } from '@DTO/program-rating-request.dto';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { BaseDTO } from '@DTO/base.dto';

@Controller('rating')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  /**
   * @param programId currently selected program
   * @returns contains total & average rating for that program
   */
  @Get('/asset/:title')
  async getRating(@Param('title') assetTitle: string) {
    let res = await this.ratingService.getTotalAndAverageRatingByProgram(
      decodeURIComponent(assetTitle),
    );
    return res;
  }

  /**
   *
   * @param userId currently logged-in user
   * @returns contains whether user has already rated on this program or not
   */
  @Get('/user')
  async checkUserRating(
    @Query('userId') userId: string,
    @Query('assetId') assetId: string,
  ): Promise<ApiResponse<boolean>> {
    let res = await this.ratingService.checkRating(userId, assetId);
    return res;
  }

  /**
   * This endpoint is responsible for creating rating for that particular userId & programId
   * @param ratingRequest contains logged-in user/programId & Its rating
   * @returns newly created rating object..
   */
  @Post('rate')
  async rateProgramUserWise(
    @Body() ratingRequest: ProgramRatingRequestDTO,
  ): Promise<ApiResponse<BaseDTO>> {
    ratingRequest.assetTitle = decodeURIComponent(ratingRequest.assetTitle);
    let res = await this.ratingService.createRating(ratingRequest);
    return res;
  }

  /**
   * This endpoint is responsible for creating rating for that particular Excel files
          * 
        userId:
        "631a212a0940dfa47e4e54be"
        assetId:
        "assetId"
        rating
        <rating>
        assetTitle
        "assetTitle"
        __v
        0
   * @param ratingRequest contains logged-in user/programId & Its rating
   * @returns newly created rating object..
   */
  @Post('bulkRate')
  async bulkRateProgramThroughExcel(): Promise<ApiResponse<BaseDTO>> {
    let res = await this.ratingService.bulkRateProgramThroughExcel();
    return res;
  }
}
