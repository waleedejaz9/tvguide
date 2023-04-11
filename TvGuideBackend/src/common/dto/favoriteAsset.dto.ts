import { AutoMap } from '@automapper/classes';

export class FavoritesAssetDTO {
    @AutoMap()
    public assetId: string;
    @AutoMap()
    public image: string;
    @AutoMap()
    public title: string;
    @AutoMap()
    public scheduleId: string;
    @AutoMap()
    public programStartTime: string;
    @AutoMap()
    public startDate: string;
}
