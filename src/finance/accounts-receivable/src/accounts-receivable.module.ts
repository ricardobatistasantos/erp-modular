import { Module } from '@nestjs/common';
import { AccountsReceivableController } from './presentation/controllers/accounts-receivable.controller';
import { CreateAccountsReceivableUseCase } from './application/use-cases/create-accounts-receivable.use-case';
import { GetByIdAccountsReceivableUseCase } from './application/use-cases/get-by-id-accounts-receivable.use-case';

@Module({
  imports: [],
  controllers: [AccountsReceivableController],
  providers: [
    CreateAccountsReceivableUseCase,
    GetByIdAccountsReceivableUseCase,
  ],
})
export class AccountsReceivableModule {}
