import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import ResponseHelper from '@Helper/response-helper';
import { HttpStatus, Injectable } from '@nestjs/common';
import { format } from 'date-fns';
import { addMinutes } from 'date-fns';
import ApiResponse from '@Helper/api-response';
import { ScheduleService } from './schedule.service';
import { AssetCalendarResponseDTO } from '@DTO/asset-calendar-response.dto';
import { AssetScheduleDTO } from '@DTO/asset-schedule.dto';
import { AssetRepository } from '@Repository/asset.repository';
import { Mapper as MapperToCreate } from '@automapper/types';
import { FavoriteRepository } from '@Repository/favorite.repository';
import { FavoritesDTO } from '@DTO/favorites.dto';
import { Favorite } from '@Entities/favorites.entity';
import { AssetService } from './asset.service';
import { AssetSchedulesWithSeasonsEpisodesDTO } from '@DTO/asset-schedules-with-seaons-episodes.dto';
import { BaseDTO } from '@DTO/base.dto';
/**
 * This service is responsible for handling asset (program) document and its related operations.
 */
@Injectable()
export class FavoriteService {
    /**
     * This is constructor which is used to initialize the asset repository..
     */
    constructor(
        @InjectMapper() private readonly mapper: Mapper,
        @InjectMapper() private readonly mapperToCreateEntity: MapperToCreate,
        private favoriteRepository: FavoriteRepository,
        private assetService: AssetService,
    ) { }

    public async CreateFavoritesAsset(
        userId: string,
        userFavorites: FavoritesDTO,
    ) {
        let favorite = this.mapperToCreateEntity.map(
            userFavorites,
            Favorite,
            FavoritesDTO,
        );
        const result = await this.favoriteRepository.create(favorite);
        if (result.id) {
            return ResponseHelper.CreateResponse<BaseDTO>(
                result,
                HttpStatus.CREATED,
            );
        } else {
            return ResponseHelper.CreateResponse<BaseDTO>(
                null,
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    public async CheckFavoritesAsset(
        userId: string,
        assetId: string,
    ): Promise<ApiResponse<boolean>> {
        try {
            let result = await this.favoriteRepository.checkFavorite(userId, assetId);
            if (result) {
                return ResponseHelper.CreateResponse<boolean>(true, HttpStatus.OK);
            }
            return ResponseHelper.CreateResponse<boolean>(false, HttpStatus.OK);
        } catch (e: any) {
            return ResponseHelper.CreateResponse<boolean>(
                false,
                HttpStatus.NOT_FOUND,
            );
        }
    }

    /**
     * updates user channels
     * @returns ApiResponse<string>
     */
    public async UpdateUserFavorite(
        userId: string,
        favoritesChannel: FavoritesDTO,
    ): Promise<ApiResponse<string>> {
        let favorites = this.mapperToCreateEntity.map(
            favoritesChannel,
            Favorite,
            FavoritesDTO,
        );
        const result = await this.favoriteRepository.updateUserFavorite(
            userId,
            favorites,
        );
        if (result) {
            return ResponseHelper.CreateResponse<string>(result, HttpStatus.CREATED);
        } else {
            return ResponseHelper.CreateResponse<string>(
                'requested user channels are not updated',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    public async GetFavoritesAsset(userId: string): Promise<ApiResponse<FavoritesDTO>> {
        let favoriteChannels = await this.favoriteRepository.getAllUserFavoriteChannelById(userId);
        let response = this.mapper.map(favoriteChannels, Favorite, FavoritesDTO);
        if (response) {
            return ResponseHelper.CreateResponse<FavoritesDTO>(
                response,
                HttpStatus.OK,
            );
        } else {
            return ResponseHelper.CreateResponse<FavoritesDTO>(
                null,
                HttpStatus.OK,
            );
        }
    }

    public async getFavoriteShowDetails(
        assetId: string,
    ): Promise<ApiResponse<AssetSchedulesWithSeasonsEpisodesDTO[]>> {
        const favoriteAsset = await this.assetService.GetAassetsSchedule(
            assetId,
        );
        if (favoriteAsset) {
            return favoriteAsset;
        } else {
            return ResponseHelper.CreateResponse<
                AssetSchedulesWithSeasonsEpisodesDTO[]
            >(null, HttpStatus.NOT_FOUND);
        }
    }

    /**
     * deletes user channel
     * @returns ApiResponse<string>
     */
    public async DeleteFavorite(
        userId: string,
        favoritesAsset: [],
    ): Promise<ApiResponse<string>> {
        const result = await this.favoriteRepository.deleteFavoriteChannel(
            userId,
            favoritesAsset,
        );
        if (result) {
            return ResponseHelper.CreateResponse<string>(result, HttpStatus.CREATED);
        } else {
            return ResponseHelper.CreateResponse<string>(
                'requested Favorite channel is not deleted',
                HttpStatus.BAD_REQUEST,
            );
        }
    }
}
