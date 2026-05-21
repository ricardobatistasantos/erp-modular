import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CreateFinancialEntryUseCase } from '../../application/use-cases/create-financial-entry.use-case';
import { GetByIdFinancialEntryUseCase } from '../../application/use-cases/get-by-id-financial-entry.use-case';
import { FindAllFinancialEntriesUseCase } from '../../application/use-cases/find-all-financial-entries.use-case';
import { CreateFinancialEntryDTO } from '../../application/dto/create-financial-entry.dto';
import { PaginationQueryDTO } from '../../application/dto/pagination-query.dto';

@Controller('financial-entries')
export class FinancialEntryController {
  constructor(
    private readonly createFinancialEntryUseCase: CreateFinancialEntryUseCase,
    private readonly getByIdFinancialEntryUseCase: GetByIdFinancialEntryUseCase,
    private readonly findAllFinancialEntriesUseCase: FindAllFinancialEntriesUseCase,
  ) {}

  @Post()
  create(@Body() createFinancialEntryDto: CreateFinancialEntryDTO) {
    return this.createFinancialEntryUseCase.execute(createFinancialEntryDto);
  }

  @Get(':id')
  getFinancialEntryById(@Param('id') id: string) {
    return this.getByIdFinancialEntryUseCase.execute({ id });
  }

  @Get()
  findAll(@Query() query: PaginationQueryDTO) {
    return this.findAllFinancialEntriesUseCase.execute(query);
  }
}
