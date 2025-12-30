import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { CreateBankAccountsUseCase } from '../../application/use-cases/create-bank-accounts.use-case';
import { GetByIdBankAccountsUseCase } from '../../application/use-cases/get-by-id-bank-accounts.use-case';

@Controller('bank-accounts')
export class BankAccountsController {
  constructor(
    private readonly createBankAccountsUseCase: CreateBankAccountsUseCase,
    private readonly getByIdBankAccountsUseCase: GetByIdBankAccountsUseCase,
  ) {}

  @Get(':id')
  getBankAccountsById() {
    return this.getByIdBankAccountsUseCase.execute({ id: 'some-id' });
  }

  @Get()
  findAll() {
    return 'All BankAccountss';
  }

  @Post()
  create(@Body() createBankAccountsDto: any) {
    return this.createBankAccountsUseCase.execute(createBankAccountsDto);
  }

  @Put()
  updateBankAccounts(@Body() createBankAccountsDto: any) {
    return createBankAccountsDto;
  }
}
