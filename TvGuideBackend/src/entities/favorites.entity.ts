import { Document, ObjectId } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AutoMap } from '@automapper/classes';
import { FavoritesAssetDTO } from '@DTO/favoriteAsset.dto';
export type FavoriteDocument = Favorite & Document;

@Schema()
export class Favorite extends Document {
    @AutoMap()
    @Prop()
    public userId: string;
    @Prop()
    @AutoMap(() => [FavoritesAssetDTO])
    public favoritesAsset: FavoritesAssetDTO[] = [];

}

export const FavoriteSchema = SchemaFactory.createForClass(Favorite);
