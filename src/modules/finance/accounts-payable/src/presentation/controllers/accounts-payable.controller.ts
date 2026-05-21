import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CreateAccountPayableUseCase } from '../../application/use-cases/create-account-payable.use-case';
import { GetByIdAccountPayableUseCase } from '../../application/use-cases/get-by-id-account-payable.use-case';
import { FindAllAccountPayablesUseCase } from '../../application/use-cases/find-all-account-payables.use-case';
import { UpdateAccountPayableUseCase } from '../../application/use-cases/update-account-payable.use-case';
import { CreateAccountPayableDTO } from '../../application/dto/create-account-payable.dto';
import { UpdateAccountPayableDTO } from '../../application/dto/update-account-payable.dto';
import { PaginationQueryDTO } from '../../application/dto/pagination-query.dto';

@Controller('accounts-payable')
export class AccountsPayableController {
  constructor(
    private readonly createAccountPayableUseCase: CreateAccountPayableUseCase,
    private readonly getByIdAccountPayableUseCase: GetByIdAccountPayableUseCase,
    private readonly findAllAccountPayablesUseCase: FindAllAccountPayablesUseCase,
    private readonly updateAccountPayableUseCase: UpdateAccountPayableUseCase,
  ) {}

  @Get(':id')
  getAccountPayableById(@Param('id') id: string) {
    return this.getByIdAccountPayableUseCase.execute({ id });
  }

  @Get()
  findAll(@Query() query: PaginationQueryDTO) {
    return this.findAllAccountPayablesUseCase.execute(query);
  }

  @Post()
  create(@Body() createAccountPayableDto: CreateAccountPayableDTO) {
    return this.createAccountPayableUseCase.execute(createAccountPayableDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateAccountPayableDto: UpdateAccountPayableDTO) {
    return this.updateAccountPayableUseCase.execute({ id, data: updateAccountPayableDto });
  }
}
