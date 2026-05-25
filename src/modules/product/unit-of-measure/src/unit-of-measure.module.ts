import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../../infra/databases/pg-promise/config.module';
import { UnitOfMeasureController } from './presentation/controllers/unit-of-measure.controller';
import { UnitOfMeasureRepository } from './infra/repository/unit-of-measure.repository';
import { CreateUnitOfMeasureUseCase } from './application/use-cases/create-unit-of-measure.use-case';
import { GetByIdUnitOfMeasureUseCase } from './application/use-cases/get-by-id-unit-of-measure.use-case';
import { FindAllUnitsOfMeasureUseCase } from './application/use-cases/find-all-units-of-measure.use-case';
import { UpdateUnitOfMeasureUseCase } from './application/use-cases/update-unit-of-measure.use-case';

@Module({
  imports: [DatabaseModule],
  controllers: [UnitOfMeasureController],
  providers: [
    { provide: 'IUnitOfMeasureRepository', useClass: UnitOfMeasureRepository },
    CreateUnitOfMeasureUseCase,
    GetByIdUnitOfMeasureUseCase,
    FindAllUnitsOfMeasureUseCase,
    UpdateUnitOfMeasureUseCase,
  ],
  exports: [
    'IUnitOfMeasureRepository',
    CreateUnitOfMeasureUseCase,
    GetByIdUnitOfMeasureUseCase,
    FindAllUnitsOfMeasureUseCase,
    UpdateUnitOfMeasureUseCase,
  ],
})
export class UnitOfMeasureModule {}
