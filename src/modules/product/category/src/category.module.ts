import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../../infra/databases/pg-promise/config.module';
import { CategoryController } from './presentation/controllers/category.controller';
import { CategoryRepository } from './infra/repository/category.repository';
import { CreateCategoryUseCase } from './application/use-cases/create-category.use-case';
import { GetByIdCategoryUseCase } from './application/use-cases/get-by-id-category.use-case';
import { FindAllCategoriesUseCase } from './application/use-cases/find-all-categories.use-case';
import { UpdateCategoryUseCase } from './application/use-cases/update-category.use-case';

@Module({
  imports: [DatabaseModule],
  controllers: [CategoryController],
  providers: [
    { provide: 'ICategoryRepository', useClass: CategoryRepository },
    CreateCategoryUseCase,
    GetByIdCategoryUseCase,
    FindAllCategoriesUseCase,
    UpdateCategoryUseCase,
  ],
  exports: [
    'ICategoryRepository',
    CreateCategoryUseCase,
    GetByIdCategoryUseCase,
    FindAllCategoriesUseCase,
    UpdateCategoryUseCase,
  ],
})
export class CategoryModule {}
