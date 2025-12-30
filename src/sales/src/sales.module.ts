import { Module } from '@nestjs/common';
import { SalesController } from './presentation/controllers/sales.controller';
import { CreateSalesUseCase } from './application/use-cases/create-sales.use-case';
import { GetByIdSalesUseCase } from './application/use-cases/get-by-id-sales.use-case';

@Module({
  imports: [],
  controllers: [SalesController],
  providers: [CreateSalesUseCase, GetByIdSalesUseCase],
})
export class SalesModule {}
