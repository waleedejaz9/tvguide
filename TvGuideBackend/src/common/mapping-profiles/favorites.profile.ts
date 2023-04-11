import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { FavoritesDTO } from '@DTO/favorites.dto';
import { Favorite } from '@Entities/favorites.entity';

@Injectable()
export class FavoriteProfile extends AutomapperProfile {
    constructor(@InjectMapper() mapper: Mapper) {
        super(mapper);
    }

    override get profile() {
        return (mapper) => {
            createMap(mapper, Favorite, FavoritesDTO),
                createMap(mapper, FavoritesDTO, Favorite);
        };
    }
}
