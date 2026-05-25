import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../../infra/databases/pg-promise/config.module';
import { CategoryModule } from '../../category/src/category.module';
import { SubCategoryController } from './presentation/controllers/sub-category.controller';
import { SubCategoryRepository } from './infra/repository/sub-category.repository';
import { CreateSubCategoryUseCase } from './application/use-cases/create-sub-category.use-case';
import { GetByIdSubCategoryUseCase } from './application/use-cases/get-by-id-sub-category.use-case';
import { FindAllSubCategoriesUseCase } from './application/use-cases/find-all-sub-categories.use-case';
import { UpdateSubCategoryUseCase } from './application/use-cases/update-sub-category.use-case';

@Module({
  imports: [DatabaseModule, CategoryModule],
  controllers: [SubCategoryController],
  providers: [
    { provide: 'ISubCategoryRepository', useClass: SubCategoryRepository },
    CreateSubCategoryUseCase,
    GetByIdSubCategoryUseCase,
    FindAllSubCategoriesUseCase,
    UpdateSubCategoryUseCase,
  ],
  exports: [
    'ISubCategoryRepository',
    CreateSubCategoryUseCase,
    GetByIdSubCategoryUseCase,
    FindAllSubCategoriesUseCase,
    UpdateSubCategoryUseCase,
  ],
})
export class SubCategoryModule {}
