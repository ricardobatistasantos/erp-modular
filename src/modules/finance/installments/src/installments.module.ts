import { Module, forwardRef } from '@nestjs/common';
import { DatabaseModule } from '../../../../infra/databases/pg-promise/config.module';
import { AccountsPayableModule } from '../../../finance/accounts-payable/src/accounts-payable.module';
import { AccountsReceivableModule } from '../../../finance/accounts-receivable/src/accounts-receivable.module';
import { FinancialSettlementsModule } from '../../../finance/financial-settlements/src/financial-settlements.module';
import { InstallmentController } from './presentation/controllers/installment.controller';
import { InstallmentRepository } from './infra/repository/installment.repository';
import { CreateInstallmentUseCase } from './application/use-cases/create-installment.use-case';
import { GetByIdInstallmentUseCase } from './application/use-cases/get-by-id-installment.use-case';
import { FindByOrigemIdInstallmentUseCase } from './application/use-cases/find-by-origem-id-installment.use-case';
import { GenerateInstallmentsUseCase } from './application/use-cases/generate-installments.use-case';
import { CancelInstallmentUseCase } from './application/use-cases/cancel-installment.use-case';

@Module({
  imports: [
    DatabaseModule,
    AccountsPayableModule,
    AccountsReceivableModule,
    forwardRef(() => FinancialSettlementsModule),
  ],
  controllers: [InstallmentController],
  providers: [
    {
      provide: 'IInstallmentRepository',
      useClass: InstallmentRepository,
    },
    CreateInstallmentUseCase,
    GetByIdInstallmentUseCase,
    FindByOrigemIdInstallmentUseCase,
    GenerateInstallmentsUseCase,
    CancelInstallmentUseCase,
  ],
  exports: [
    CreateInstallmentUseCase,
    GetByIdInstallmentUseCase,
    FindByOrigemIdInstallmentUseCase,
    GenerateInstallmentsUseCase,
    CancelInstallmentUseCase,
    'IInstallmentRepository',
  ],
})
export class InstallmentsModule {}
