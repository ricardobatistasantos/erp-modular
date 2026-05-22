import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../../infra/databases/pg-promise/config.module';
import { BankAgenciesModule } from '../../bank-agencies/src/bank-agencies.module';
import { BankAccountsController } from './presentation/controllers/bank-accounts.controller';
import { BankAccountRepository } from './infra/repository/bank-account.repository';
import { CreateBankAccountUseCase } from './application/use-cases/create-bank-account.use-case';
import { GetByIdBankAccountUseCase } from './application/use-cases/get-by-id-bank-account.use-case';
import { FindAllBankAccountsUseCase } from './application/use-cases/find-all-bank-accounts.use-case';
import { UpdateBankAccountUseCase } from './application/use-cases/update-bank-account.use-case';
import { DeleteBankAccountUseCase } from './application/use-cases/delete-bank-account.use-case';

@Module({
  imports: [DatabaseModule, BankAgenciesModule],
  controllers: [BankAccountsController],
  providers: [
    { provide: 'IBankAccountRepository', useClass: BankAccountRepository },
    CreateBankAccountUseCase,
    GetByIdBankAccountUseCase,
    FindAllBankAccountsUseCase,
    UpdateBankAccountUseCase,
    DeleteBankAccountUseCase,
  ],
  exports: ['IBankAccountRepository'],
})
export class BankAccountsModule {}
