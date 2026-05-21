import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../../infra/databases/pg-promise/config.module';
import { AccountsPayableModule } from '../../accounts-payable/src/accounts-payable.module';
import { AccountsReceivableModule } from '../../accounts-receivable/src/accounts-receivable.module';
import { FinancialEntriesModule } from '../../financial-entries/src/financial-entries.module';
import { FinancialSettlementController } from './presentation/controllers/financial-settlement.controller';
import { FinancialSettlementRepository } from './infra/repository/financial-settlement.repository';
import { CreateFinancialSettlementUseCase } from './application/use-cases/create-financial-settlement.use-case';
import { GetByIdFinancialSettlementUseCase } from './application/use-cases/get-by-id-financial-settlement.use-case';
import { FindByContaIdFinancialSettlementUseCase } from './application/use-cases/find-by-conta-id-financial-settlement.use-case';

@Module({
  imports: [DatabaseModule, AccountsPayableModule, AccountsReceivableModule, FinancialEntriesModule],
  controllers: [FinancialSettlementController],
  providers: [
    {
      provide: 'IFinancialSettlementRepository',
      useClass: FinancialSettlementRepository,
    },
    CreateFinancialSettlementUseCase,
    GetByIdFinancialSettlementUseCase,
    FindByContaIdFinancialSettlementUseCase,
  ],
  exports: [
    CreateFinancialSettlementUseCase,
    GetByIdFinancialSettlementUseCase,
    FindByContaIdFinancialSettlementUseCase,
  ],
})
export class FinancialSettlementsModule {}
