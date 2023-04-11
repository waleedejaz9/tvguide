import { Body, Controller, Get, Post, Query, Put } from '@nestjs/common';
import { UserService } from '@Services/user.service';
import ApiResponse from '@Helper/api-response';
import { UserDTO } from '@DTO/user-response.dto';
import { BaseDTO } from '@DTO/base.dto';
import { GlobalConfigurationService } from '@Services/global-configuration.service';
import { GlobalConfigurationDTO } from '@DTO/global-configuration.dto';

@Controller('globalconfiguration')
export class GlobalConfigurationController {
  constructor(
    private readonly globalConfigService: GlobalConfigurationService,
  ) {}

  @Get()
  async get(): Promise<ApiResponse<GlobalConfigurationDTO>> {
    return await this.globalConfigService.getConfig();
  }

  @Put('')
  async update(
    @Body() config: GlobalConfigurationDTO,
  ): Promise<ApiResponse<boolean>> {
    return await this.globalConfigService.findReplaceConfig(config);
  }
}
