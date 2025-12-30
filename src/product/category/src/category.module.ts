import { Module } from '@nestjs/common';
import { CategoryController } from './presentation/controllers/category.controller';
import { CreateCategoryUseCase } from './application/use-cases/create-category.use-case';
import { GetByIdCategoryUseCase } from './application/use-cases/get-by-id-category.use-case';

@Module({
  imports: [],
  controllers: [CategoryController],
  providers: [CreateCategoryUseCase, GetByIdCategoryUseCase],
})
export class CategoryModule {}
