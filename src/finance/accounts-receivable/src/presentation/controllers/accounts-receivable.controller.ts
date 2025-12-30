import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { CreateAccountsReceivableUseCase } from '../../application/use-cases/create-accounts-receivable.use-case';
import { GetByIdAccountsReceivableUseCase } from '../../application/use-cases/get-by-id-accounts-receivable.use-case';

@Controller('accounts-receivable')
export class AccountsReceivableController {
  constructor(
    private readonly createAccountsReceivableUseCase: CreateAccountsReceivableUseCase,
    private readonly getByIdAccountsReceivableUseCase: GetByIdAccountsReceivableUseCase,
  ) {}

  @Get(':id')
  getAccountsReceivableById() {
    return this.getByIdAccountsReceivableUseCase.execute({ id: 'some-id' });
  }

  @Get()
  findAll() {
    return 'All AccountsReceivables';
  }

  @Post()
  create(@Body() createAccountsReceivableDto: any) {
    return this.createAccountsReceivableUseCase.execute(
      createAccountsReceivableDto,
    );
  }

  @Put()
  updateAccountsReceivable(@Body() createAccountsReceivableDto: any) {
    return createAccountsReceivableDto;
  }
}
