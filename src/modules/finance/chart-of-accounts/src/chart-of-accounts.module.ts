import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../../infra/databases/pg-promise/config.module';
import { ChartOfAccountsController } from './presentation/controllers/chart-of-accounts.controller';
import { ChartOfAccountsRepository } from './infra/repository/chart-of-accounts.repository';
import { CreateChartOfAccountsUseCase } from './application/use-cases/create-chart-of-accounts.use-case';
import { GetByIdChartOfAccountsUseCase } from './application/use-cases/get-by-id-chart-of-accounts.use-case';
import { FindAllChartOfAccountsUseCase } from './application/use-cases/find-all-chart-of-accounts.use-case';
import { UpdateChartOfAccountsUseCase } from './application/use-cases/update-chart-of-accounts.use-case';

@Module({
  imports: [DatabaseModule],
  controllers: [ChartOfAccountsController],
  providers: [
    {
      provide: 'IChartOfAccountsRepository',
      useClass: ChartOfAccountsRepository,
    },
    CreateChartOfAccountsUseCase,
    GetByIdChartOfAccountsUseCase,
    FindAllChartOfAccountsUseCase,
    UpdateChartOfAccountsUseCase,
  ],
  exports: [
    CreateChartOfAccountsUseCase,
    GetByIdChartOfAccountsUseCase,
    FindAllChartOfAccountsUseCase,
    UpdateChartOfAccountsUseCase,
    'IChartOfAccountsRepository',
  ],
})
export class ChartOfAccountsModule {}
