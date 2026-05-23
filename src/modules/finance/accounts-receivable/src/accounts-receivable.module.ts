import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../../infra/databases/pg-promise/config.module';
import { AccountsReceivableController } from './presentation/controllers/accounts-receivable.controller';
import { AccountReceivableRepository } from './infra/repository/account-receivable.repository';
import { InstallmentRepository } from '../../../finance/installments/src/infra/repository/installment.repository';
import { InstallmentCalculator } from '../../../finance/installments/src/domain/services/installment-calculator';
import { InstallmentValidation } from '../../../finance/installments/src/domain/validation/installment-validation';
import { CreateAccountReceivableUseCase } from './application/use-cases/create-account-receivable.use-case';
import { GetByIdAccountReceivableUseCase } from './application/use-cases/get-by-id-account-receivable.use-case';
import { FindAllAccountReceivablesUseCase } from './application/use-cases/find-all-account-receivables.use-case';
import { UpdateAccountReceivableUseCase } from './application/use-cases/update-account-receivable.use-case';

@Module({
  imports: [DatabaseModule],
  controllers: [AccountsReceivableController],
  providers: [
    {
      provide: 'IAccountReceivableRepository',
      useClass: AccountReceivableRepository,
    },
    {
      provide: 'IInstallmentRepository',
      useClass: InstallmentRepository,
    },
    InstallmentCalculator,
    InstallmentValidation,
    CreateAccountReceivableUseCase,
    GetByIdAccountReceivableUseCase,
    FindAllAccountReceivablesUseCase,
    UpdateAccountReceivableUseCase,
  ],
  exports: [
    CreateAccountReceivableUseCase,
    GetByIdAccountReceivableUseCase,
    FindAllAccountReceivablesUseCase,
    UpdateAccountReceivableUseCase,
    'IAccountReceivableRepository',
  ],
})
export class AccountsReceivableModule {}
