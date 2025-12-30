import { Module } from '@nestjs/common';
import { ProductController } from './presentation/controllers/product.controller';
import { CreateProductUseCase } from './application/use-cases/create-product.use-case';
import { GetByIdProductUseCase } from './application/use-cases/get-by-id-product.use-case';

@Module({
  imports: [],
  controllers: [ProductController],
  providers: [CreateProductUseCase, GetByIdProductUseCase],
})
export class ProductModule {}
