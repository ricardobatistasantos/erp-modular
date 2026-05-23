import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../../infra/databases/pg-promise/config.module';
import { AccountsPayableController } from './presentation/controllers/accounts-payable.controller';
import { AccountPayableRepository } from './infra/repository/account-payable.repository';
import { InstallmentRepository } from '../../../finance/installments/src/infra/repository/installment.repository';
import { InstallmentCalculator } from '../../../finance/installments/src/domain/services/installment-calculator';
import { InstallmentValidation } from '../../../finance/installments/src/domain/validation/installment-validation';
import { CreateAccountPayableUseCase } from './application/use-cases/create-account-payable.use-case';
import { GetByIdAccountPayableUseCase } from './application/use-cases/get-by-id-account-payable.use-case';
import { FindAllAccountPayablesUseCase } from './application/use-cases/find-all-account-payables.use-case';
import { UpdateAccountPayableUseCase } from './application/use-cases/update-account-payable.use-case';

@Module({
  imports: [DatabaseModule],
  controllers: [AccountsPayableController],
  providers: [
    {
      provide: 'IAccountPayableRepository',
      useClass: AccountPayableRepository,
    },
    {
      provide: 'IInstallmentRepository',
      useClass: InstallmentRepository,
    },
    InstallmentCalculator,
    InstallmentValidation,
    CreateAccountPayableUseCase,
    GetByIdAccountPayableUseCase,
    FindAllAccountPayablesUseCase,
    UpdateAccountPayableUseCase,
  ],
  exports: [
    CreateAccountPayableUseCase,
    GetByIdAccountPayableUseCase,
    FindAllAccountPayablesUseCase,
    UpdateAccountPayableUseCase,
    'IAccountPayableRepository',
  ],
})
export class AccountsPayableModule {}
