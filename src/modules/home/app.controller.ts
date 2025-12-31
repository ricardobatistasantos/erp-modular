import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { PermissionsGuard } from '../shared/guards/permissions.guard';
import { Permissions } from '../shared/decorators/permissions.decorator';

@UseGuards(PermissionsGuard)
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Permissions('FINANCEIRO', 'FIN_PAY')
  home(): string {
    return this.appService.getHome();
  }
}
