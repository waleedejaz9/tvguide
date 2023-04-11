import { AutoMap } from '@automapper/classes';
import { FavoritesAssetDTO } from './favoriteAsset.dto';

export class FavoritesDTO {
    @AutoMap()
    public userId: string;
    @AutoMap(() => [FavoritesAssetDTO])
    public favoritesAsset: FavoritesAssetDTO[] = [];

}
