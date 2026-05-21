import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../../infra/databases/pg-promise/config.module';
import { ChartOfAccountsModule } from '../../../finance/chart-of-accounts/src/chart-of-accounts.module';
import { FinancialCategoryController } from './presentation/controllers/financial-category.controller';
import { FinancialCategoryRepository } from './infra/repository/financial-category.repository';
import { CreateFinancialCategoryUseCase } from './application/use-cases/create-financial-category.use-case';
import { GetByIdFinancialCategoryUseCase } from './application/use-cases/get-by-id-financial-category.use-case';
import { FindAllFinancialCategoriesUseCase } from './application/use-cases/find-all-financial-categories.use-case';
import { UpdateFinancialCategoryUseCase } from './application/use-cases/update-financial-category.use-case';

@Module({
  imports: [DatabaseModule, ChartOfAccountsModule],
  controllers: [FinancialCategoryController],
  providers: [
    {
      provide: 'IFinancialCategoryRepository',
      useClass: FinancialCategoryRepository,
    },
    CreateFinancialCategoryUseCase,
    GetByIdFinancialCategoryUseCase,
    FindAllFinancialCategoriesUseCase,
    UpdateFinancialCategoryUseCase,
  ],
  exports: [
    CreateFinancialCategoryUseCase,
    GetByIdFinancialCategoryUseCase,
    FindAllFinancialCategoriesUseCase,
    UpdateFinancialCategoryUseCase,
    'IFinancialCategoryRepository',
  ],
})
export class FinancialCategoriesModule {}
