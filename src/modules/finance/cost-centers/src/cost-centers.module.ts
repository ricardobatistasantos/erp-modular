import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../../infra/databases/pg-promise/config.module';
import { CostCenterController } from './presentation/controllers/cost-center.controller';
import { CostCenterRepository } from './infra/repository/cost-center.repository';
import { CreateCostCenterUseCase } from './application/use-cases/create-cost-center.use-case';
import { GetByIdCostCenterUseCase } from './application/use-cases/get-by-id-cost-center.use-case';
import { FindAllCostCentersUseCase } from './application/use-cases/find-all-cost-centers.use-case';
import { UpdateCostCenterUseCase } from './application/use-cases/update-cost-center.use-case';

@Module({
  imports: [DatabaseModule],
  controllers: [CostCenterController],
  providers: [
    { provide: 'ICostCenterRepository', useClass: CostCenterRepository },
    CreateCostCenterUseCase,
    GetByIdCostCenterUseCase,
    FindAllCostCentersUseCase,
    UpdateCostCenterUseCase,
  ],
  exports: [
    CreateCostCenterUseCase,
    GetByIdCostCenterUseCase,
    FindAllCostCentersUseCase,
    UpdateCostCenterUseCase,
    'ICostCenterRepository',
  ],
})
export class CostCentersModule {}
