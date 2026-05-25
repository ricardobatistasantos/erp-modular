import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CreateSubCategoryUseCase } from '../../application/use-cases/create-sub-category.use-case';
import { GetByIdSubCategoryUseCase } from '../../application/use-cases/get-by-id-sub-category.use-case';
import { FindAllSubCategoriesUseCase } from '../../application/use-cases/find-all-sub-categories.use-case';
import { UpdateSubCategoryUseCase } from '../../application/use-cases/update-sub-category.use-case';
import { CreateSubCategoryDTO } from '../../application/dto/create-sub-category.dto';
import { UpdateSubCategoryDTO } from '../../application/dto/update-sub-category.dto';
import { PaginationQueryDTO } from '../../application/dto/pagination-query.dto';

@Controller('sub-category')
export class SubCategoryController {
  constructor(
    private readonly createSubCategoryUseCase: CreateSubCategoryUseCase,
    private readonly getByIdSubCategoryUseCase: GetByIdSubCategoryUseCase,
    private readonly findAllSubCategoriesUseCase: FindAllSubCategoriesUseCase,
    private readonly updateSubCategoryUseCase: UpdateSubCategoryUseCase,
  ) {}

  @Post()
  create(@Body() createSubCategoryDto: CreateSubCategoryDTO) {
    return this.createSubCategoryUseCase.execute(createSubCategoryDto);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.getByIdSubCategoryUseCase.execute({ id });
  }

  @Get()
  findAll(@Query() query: PaginationQueryDTO) {
    return this.findAllSubCategoriesUseCase.execute(query);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateSubCategoryDto: UpdateSubCategoryDTO) {
    return this.updateSubCategoryUseCase.execute({ id, data: updateSubCategoryDto });
  }
}
