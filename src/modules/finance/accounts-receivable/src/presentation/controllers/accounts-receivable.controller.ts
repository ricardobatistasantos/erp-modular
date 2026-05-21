import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CreateAccountReceivableUseCase } from '../../application/use-cases/create-account-receivable.use-case';
import { GetByIdAccountReceivableUseCase } from '../../application/use-cases/get-by-id-account-receivable.use-case';
import { FindAllAccountReceivablesUseCase } from '../../application/use-cases/find-all-account-receivables.use-case';
import { UpdateAccountReceivableUseCase } from '../../application/use-cases/update-account-receivable.use-case';
import { CreateAccountReceivableDTO } from '../../application/dto/create-account-receivable.dto';
import { UpdateAccountReceivableDTO } from '../../application/dto/update-account-receivable.dto';
import { PaginationQueryDTO } from '../../application/dto/pagination-query.dto';

@Controller('accounts-receivable')
export class AccountsReceivableController {
  constructor(
    private readonly createAccountReceivableUseCase: CreateAccountReceivableUseCase,
    private readonly getByIdAccountReceivableUseCase: GetByIdAccountReceivableUseCase,
    private readonly findAllAccountReceivablesUseCase: FindAllAccountReceivablesUseCase,
    private readonly updateAccountReceivableUseCase: UpdateAccountReceivableUseCase,
  ) {}

  @Get(':id')
  getAccountReceivableById(@Param('id') id: string) {
    return this.getByIdAccountReceivableUseCase.execute({ id });
  }

  @Get()
  findAll(@Query() query: PaginationQueryDTO) {
    return this.findAllAccountReceivablesUseCase.execute(query);
  }

  @Post()
  create(@Body() createAccountReceivableDto: CreateAccountReceivableDTO) {
    return this.createAccountReceivableUseCase.execute(createAccountReceivableDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateAccountReceivableDto: UpdateAccountReceivableDTO) {
    return this.updateAccountReceivableUseCase.execute({ id, data: updateAccountReceivableDto });
  }
}
