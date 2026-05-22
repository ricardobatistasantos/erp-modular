import { Module, forwardRef } from '@nestjs/common';
import { DatabaseModule } from '../../../../infra/databases/pg-promise/config.module';
import { AccountsPayableModule } from '../../accounts-payable/src/accounts-payable.module';
import { AccountsReceivableModule } from '../../accounts-receivable/src/accounts-receivable.module';
import { FinancialEntriesModule } from '../../financial-entries/src/financial-entries.module';
import { InstallmentsModule } from '../../installments/src/installments.module';
import { FinancialSettlementController } from './presentation/controllers/financial-settlement.controller';
import { FinancialSettlementRepository } from './infra/repository/financial-settlement.repository';
import { SettleInstallmentUseCase } from './application/use-cases/settle-installment.use-case';
import { GetByIdFinancialSettlementUseCase } from './application/use-cases/get-by-id-financial-settlement.use-case';
import { FindByParcelaIdFinancialSettlementUseCase } from './application/use-cases/find-by-parcela-id-financial-settlement.use-case';

@Module({
  imports: [DatabaseModule, AccountsPayableModule, AccountsReceivableModule, FinancialEntriesModule, forwardRef(() => InstallmentsModule)],
  controllers: [FinancialSettlementController],
  providers: [
    {
      provide: 'IFinancialSettlementRepository',
      useClass: FinancialSettlementRepository,
    },
    SettleInstallmentUseCase,
    GetByIdFinancialSettlementUseCase,
    FindByParcelaIdFinancialSettlementUseCase,
  ],
  exports: [
    SettleInstallmentUseCase,
    GetByIdFinancialSettlementUseCase,
    FindByParcelaIdFinancialSettlementUseCase,
    'IFinancialSettlementRepository',
  ],
})
export class FinancialSettlementsModule {}
