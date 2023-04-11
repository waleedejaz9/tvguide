import { AutoMap } from '@automapper/classes';

export class CreateUserDTO {
  @AutoMap()
  email: string;
  @AutoMap()
  region: string;
}
