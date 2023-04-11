import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Favorite, FavoriteDocument } from '@Entities/favorites.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class FavoriteRepository extends BaseRepository<FavoriteDocument> {
    constructor(
        @InjectModel(Favorite.name)
        private model: Model<Favorite>,

    ) {
        super(model);
    }

    public async getAllUserFavoriteChannelById(userId: string): Promise<FavoriteDocument> {
        let result = await this.getOneByFilter({ userId: userId })
        return result
    }

    public async checkFavorite(userId: string, assetId: string): Promise<FavoriteDocument> {
        let result = await this.getOneByFilter({ userId: userId, 'favoritesAsset.assetId': assetId })
        return result
    }

    public async deleteFavoriteChannel(userId: string, favoritesAsset: any): Promise<string> {
        let result = await this.findByFilterAndDeleteInArray({ userId: userId }, favoritesAsset)
        return result;
    }

    /**
    * This method updates user channels based on user id and channel list array
    * @returns channelIds
    */
    public async updateUserFavorite(userId: string, favoritesAsset: FavoriteDocument): Promise<string> {
        let result = await this.findByFilterAndModify({ userId: userId }, favoritesAsset)
        return result;
    }

}
