import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { CreateCategoryUseCase } from '../../application/use-cases/create-category.use-case';
import { GetByIdCategoryUseCase } from '../../application/use-cases/get-by-id-category.use-case';

@Controller('category')
export class CategoryController {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly getByIdCategoryUseCase: GetByIdCategoryUseCase,
  ) {}

  @Get(':id')
  getCategoryById() {
    return this.getByIdCategoryUseCase.execute({ id: 'some-id' });
  }

  @Get()
  findAll() {
    return 'All categories';
  }

  @Post()
  create(@Body() createCategoryDto: any) {
    return this.createCategoryUseCase.execute(createCategoryDto);
  }

  @Put()
  updateCategory(@Body() updateCategoryDto: any) {
    return updateCategoryDto;
  }
}
