import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CreateBankAccountUseCase } from '../../application/use-cases/create-bank-account.use-case';
import { GetByIdBankAccountUseCase } from '../../application/use-cases/get-by-id-bank-account.use-case';
import { FindAllBankAccountsUseCase } from '../../application/use-cases/find-all-bank-accounts.use-case';
import { UpdateBankAccountUseCase } from '../../application/use-cases/update-bank-account.use-case';
import { DeleteBankAccountUseCase } from '../../application/use-cases/delete-bank-account.use-case';
import { CreateBankAccountDTO } from '../../application/dto/create-bank-account.dto';
import { UpdateBankAccountDTO } from '../../application/dto/update-bank-account.dto';
import { PaginationQueryDTO } from '../../application/dto/pagination-query.dto';

@Controller('bank-accounts')
export class BankAccountsController {
  constructor(
    private readonly createBankAccountUseCase: CreateBankAccountUseCase,
    private readonly getByIdBankAccountUseCase: GetByIdBankAccountUseCase,
    private readonly findAllBankAccountsUseCase: FindAllBankAccountsUseCase,
    private readonly updateBankAccountUseCase: UpdateBankAccountUseCase,
    private readonly deleteBankAccountUseCase: DeleteBankAccountUseCase,
  ) {}

  @Post()
  create(@Body() dto: CreateBankAccountDTO) {
    return this.createBankAccountUseCase.execute(dto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDTO) {
    return this.findAllBankAccountsUseCase.execute(query);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.getByIdBankAccountUseCase.execute({ id });
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBankAccountDTO) {
    return this.updateBankAccountUseCase.execute({ id, data: dto });
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.deleteBankAccountUseCase.execute({ id });
  }
}
