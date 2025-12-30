import { Module } from '@nestjs/common';
import { AccountsPayableController } from './presentation/controllers/accounts-payable.controller';
import { CreateAccountsPayableUseCase } from './application/use-cases/create-accounts-payable.use-case';
import { GetByIdAccountsPayableUseCase } from './application/use-cases/get-by-id-accounts-payable.use-case';

@Module({
  imports: [],
  controllers: [AccountsPayableController],
  providers: [CreateAccountsPayableUseCase, GetByIdAccountsPayableUseCase],
})
export class AccountsPayableModule {}
