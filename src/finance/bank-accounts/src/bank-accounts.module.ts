import { Module } from '@nestjs/common';
import { BankAccountsController } from './presentation/controllers/bank-accounts.controller';
import { CreateBankAccountsUseCase } from './application/use-cases/create-bank-accounts.use-case';
import { GetByIdBankAccountsUseCase } from './application/use-cases/get-by-id-bank-accounts.use-case';

@Module({
  imports: [],
  controllers: [BankAccountsController],
  providers: [CreateBankAccountsUseCase, GetByIdBankAccountsUseCase],
})
export class BankAccountsModule {}
