import { Module } from '@nestjs/common';
import { SubCategoryController } from './presentation/controllers/sub-category.controller';
import { CreateSubCategoryUseCase } from './application/use-cases/create-sub-category.use-case';
import { GetByIdSubCategoryUseCase } from './application/use-cases/get-by-id-sub-category.use-case';

@Module({
  imports: [],
  controllers: [SubCategoryController],
  providers: [CreateSubCategoryUseCase, GetByIdSubCategoryUseCase],
})
export class SubCategoryModule {}
