import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../../infra/databases/pg-promise/config.module';
import { SubCategoryModule } from '../../sub-category/src/sub-category.module';
import { UnitOfMeasureModule } from '../../unit-of-measure/src/unit-of-measure.module';
import { BrandModule } from '../../brand/src/brand.module';
import { ProductController } from './presentation/controllers/product.controller';
import { ProductRepository } from './infra/repository/product.repository';
import { CreateProductUseCase } from './application/use-cases/create-product.use-case';
import { GetByIdProductUseCase } from './application/use-cases/get-by-id-product.use-case';
import { FindAllProductsUseCase } from './application/use-cases/find-all-products.use-case';
import { UpdateProductUseCase } from './application/use-cases/update-product.use-case';

@Module({
  imports: [DatabaseModule, SubCategoryModule, UnitOfMeasureModule, BrandModule],
  controllers: [ProductController],
  providers: [
    { provide: 'IProductRepository', useClass: ProductRepository },
    CreateProductUseCase,
    GetByIdProductUseCase,
    FindAllProductsUseCase,
    UpdateProductUseCase,
  ],
  exports: [
    'IProductRepository',
    CreateProductUseCase,
    GetByIdProductUseCase,
    FindAllProductsUseCase,
    UpdateProductUseCase,
  ],
})
export class ProductModule {}
