import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CreateFinancialCategoryUseCase } from '../../application/use-cases/create-financial-category.use-case';
import { GetByIdFinancialCategoryUseCase } from '../../application/use-cases/get-by-id-financial-category.use-case';
import { FindAllFinancialCategoriesUseCase } from '../../application/use-cases/find-all-financial-categories.use-case';
import { UpdateFinancialCategoryUseCase } from '../../application/use-cases/update-financial-category.use-case';
import { CreateFinancialCategoryDTO } from '../../application/dto/create-financial-category.dto';
import { UpdateFinancialCategoryDTO } from '../../application/dto/update-financial-category.dto';
import { PaginationQueryDTO } from '../../application/dto/pagination-query.dto';

@Controller('financial-categories')
export class FinancialCategoryController {
  constructor(
    private readonly createFinancialCategoryUseCase: CreateFinancialCategoryUseCase,
    private readonly getByIdFinancialCategoryUseCase: GetByIdFinancialCategoryUseCase,
    private readonly findAllFinancialCategoriesUseCase: FindAllFinancialCategoriesUseCase,
    private readonly updateFinancialCategoryUseCase: UpdateFinancialCategoryUseCase,
  ) {}

  @Post()
  create(@Body() createFinancialCategoryDto: CreateFinancialCategoryDTO) {
    return this.createFinancialCategoryUseCase.execute(createFinancialCategoryDto);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.getByIdFinancialCategoryUseCase.execute({ id });
  }

  @Get()
  findAll(@Query() query: PaginationQueryDTO) {
    return this.findAllFinancialCategoriesUseCase.execute(query);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateFinancialCategoryDto: UpdateFinancialCategoryDTO) {
    return this.updateFinancialCategoryUseCase.execute({ id, data: updateFinancialCategoryDto });
  }
}
