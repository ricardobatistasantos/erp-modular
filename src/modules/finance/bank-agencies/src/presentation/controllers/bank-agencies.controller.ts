import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CreateBankAgencyUseCase } from '../../application/use-cases/create-bank-agency.use-case';
import { GetByIdBankAgencyUseCase } from '../../application/use-cases/get-by-id-bank-agency.use-case';
import { FindAllBankAgenciesUseCase } from '../../application/use-cases/find-all-bank-agencies.use-case';
import { UpdateBankAgencyUseCase } from '../../application/use-cases/update-bank-agency.use-case';
import { DeleteBankAgencyUseCase } from '../../application/use-cases/delete-bank-agency.use-case';
import { CreateBankAgencyDTO } from '../../application/dto/create-bank-agency.dto';
import { UpdateBankAgencyDTO } from '../../application/dto/update-bank-agency.dto';
import { PaginationQueryDTO } from '../../application/dto/pagination-query.dto';

@Controller('bank-agencies')
export class BankAgenciesController {
  constructor(
    private readonly createBankAgencyUseCase: CreateBankAgencyUseCase,
    private readonly getByIdBankAgencyUseCase: GetByIdBankAgencyUseCase,
    private readonly findAllBankAgenciesUseCase: FindAllBankAgenciesUseCase,
    private readonly updateBankAgencyUseCase: UpdateBankAgencyUseCase,
    private readonly deleteBankAgencyUseCase: DeleteBankAgencyUseCase,
  ) {}

  @Post()
  create(@Body() dto: CreateBankAgencyDTO) {
    return this.createBankAgencyUseCase.execute(dto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDTO) {
    return this.findAllBankAgenciesUseCase.execute(query);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.getByIdBankAgencyUseCase.execute({ id });
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBankAgencyDTO) {
    return this.updateBankAgencyUseCase.execute({ id, data: dto });
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.deleteBankAgencyUseCase.execute({ id });
  }
}
