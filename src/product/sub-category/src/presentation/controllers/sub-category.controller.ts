import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { CreateSubCategoryUseCase } from '../../application/use-cases/create-sub-category.use-case';
import { GetByIdSubCategoryUseCase } from '../../application/use-cases/get-by-id-sub-category.use-case';

@Controller('sub-category')
export class SubCategoryController {
  constructor(
    private readonly createSubCategoryUseCase: CreateSubCategoryUseCase,
    private readonly getByIdSubCategoryUseCase: GetByIdSubCategoryUseCase,
  ) {}

  @Get(':id')
  getSubCategoryById() {
    return this.getByIdSubCategoryUseCase.execute({ id: 'some-id' });
  }

  @Get()
  findAll() {
    return 'All categories';
  }

  @Post()
  create(@Body() createSubCategoryDto: any) {
    return this.createSubCategoryUseCase.execute(createSubCategoryDto);
  }

  @Put()
  updateSubCategory(@Body() updateSubCategoryDto: any) {
    return updateSubCategoryDto;
  }
}
