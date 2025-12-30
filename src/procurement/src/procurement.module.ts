import { Module } from '@nestjs/common';
import { ProcurementController } from './presentation/controllers/procurement.controller';
import { CreateProcurementUseCase } from './application/use-cases/create-procurement.use-case';
import { GetByIdProcurementUseCase } from './application/use-cases/get-by-id-procurement.use-case';

@Module({
  imports: [],
  controllers: [ProcurementController],
  providers: [CreateProcurementUseCase, GetByIdProcurementUseCase],
})
export class ProcurementModule {}
