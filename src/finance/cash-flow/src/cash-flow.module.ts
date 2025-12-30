import { Module } from '@nestjs/common';
import { CashFlowController } from './presentation/controllers/cash-flow.controller';
import { CreateCashFlowUseCase } from './application/use-cases/create-cash-flow.use-case';
import { GetByIdCashFlowUseCase } from './application/use-cases/get-by-id-cash-flow.use-case';

@Module({
  imports: [],
  controllers: [CashFlowController],
  providers: [CreateCashFlowUseCase, GetByIdCashFlowUseCase],
})
export class CashFlowModule {}
