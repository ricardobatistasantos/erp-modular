import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CreateCategoryUseCase } from '../../application/use-cases/create-category.use-case';
import { GetByIdCategoryUseCase } from '../../application/use-cases/get-by-id-category.use-case';
import { FindAllCategoriesUseCase } from '../../application/use-cases/find-all-categories.use-case';
import { UpdateCategoryUseCase } from '../../application/use-cases/update-category.use-case';
import { CreateCategoryDTO } from '../../application/dto/create-category.dto';
import { UpdateCategoryDTO } from '../../application/dto/update-category.dto';
import { PaginationQueryDTO } from '../../application/dto/pagination-query.dto';

@Controller('category')
export class CategoryController {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly getByIdCategoryUseCase: GetByIdCategoryUseCase,
    private readonly findAllCategoriesUseCase: FindAllCategoriesUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
  ) {}

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDTO) {
    return this.createCategoryUseCase.execute(createCategoryDto);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.getByIdCategoryUseCase.execute({ id });
  }

  @Get()
  findAll(@Query() query: PaginationQueryDTO) {
    return this.findAllCategoriesUseCase.execute(query);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDTO) {
    return this.updateCategoryUseCase.execute({ id, data: updateCategoryDto });
  }
}
