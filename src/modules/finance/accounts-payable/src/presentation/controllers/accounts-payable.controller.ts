import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { CreateAccountsPayableUseCase } from '../../application/use-cases/create-accounts-payable.use-case';
import { GetByIdAccountsPayableUseCase } from '../../application/use-cases/get-by-id-accounts-payable.use-case';

@Controller('accounts-payable')
export class AccountsPayableController {
  constructor(
    private readonly createAccountsPayableUseCase: CreateAccountsPayableUseCase,
    private readonly getByIdAccountsPayableUseCase: GetByIdAccountsPayableUseCase,
  ) {}

  @Get(':id')
  getAccountsPayableById() {
    return this.getByIdAccountsPayableUseCase.execute({ id: 'some-id' });
  }

  @Get()
  findAll() {
    return 'All AccountsPayables';
  }

  @Post()
  create(@Body() createAccountsPayableDto: any) {
    return this.createAccountsPayableUseCase.execute(createAccountsPayableDto);
  }

  @Put()
  updateAccountsPayable(@Body() createAccountsPayableDto: any) {
    return createAccountsPayableDto;
  }
}
