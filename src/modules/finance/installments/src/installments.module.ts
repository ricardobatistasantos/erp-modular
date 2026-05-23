import { Module, forwardRef } from '@nestjs/common';
import { DatabaseModule } from '../../../../infra/databases/pg-promise/config.module';
import { AccountsPayableModule } from '../../../finance/accounts-payable/src/accounts-payable.module';
import { AccountsReceivableModule } from '../../../finance/accounts-receivable/src/accounts-receivable.module';
import { FinancialSettlementsModule } from '../../../finance/financial-settlements/src/financial-settlements.module';
import { InstallmentController } from './presentation/controllers/installment.controller';
import { InstallmentRepository } from './infra/repository/installment.repository';
import { InstallmentCalculator } from './domain/services/installment-calculator';
import { InstallmentValidation } from './domain/validation/installment-validation';
import { CreateInstallmentUseCase } from './application/use-cases/create-installment.use-case';
import { GetByIdInstallmentUseCase } from './application/use-cases/get-by-id-installment.use-case';
import { FindByOrigemIdInstallmentUseCase } from './application/use-cases/find-by-origem-id-installment.use-case';
import { GenerateInstallmentsUseCase } from './application/use-cases/generate-installments.use-case';
import { CancelInstallmentUseCase } from './application/use-cases/cancel-installment.use-case';
import { RecalculateInstallmentsUseCase } from './application/use-cases/recalculate-installments.use-case';
import { RegenerateInstallmentsUseCase } from './application/use-cases/regenerate-installments.use-case';
import { FindInstallmentsByOrigemUseCase } from './application/use-cases/find-installments-by-origem.use-case';

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
    InstallmentCalculator,
    InstallmentValidation,
    CreateInstallmentUseCase,
    GetByIdInstallmentUseCase,
    FindByOrigemIdInstallmentUseCase,
    GenerateInstallmentsUseCase,
    CancelInstallmentUseCase,
    RecalculateInstallmentsUseCase,
    RegenerateInstallmentsUseCase,
    FindInstallmentsByOrigemUseCase,
  ],
  exports: [
    CreateInstallmentUseCase,
    GetByIdInstallmentUseCase,
    FindByOrigemIdInstallmentUseCase,
    GenerateInstallmentsUseCase,
    CancelInstallmentUseCase,
    RecalculateInstallmentsUseCase,
    RegenerateInstallmentsUseCase,
    FindInstallmentsByOrigemUseCase,
    InstallmentCalculator,
    InstallmentValidation,
    'IInstallmentRepository',
  ],
})
export class InstallmentsModule {}
