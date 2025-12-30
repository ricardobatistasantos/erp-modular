import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { CreateProductUseCase } from '../../application/use-cases/create-product.use-case';
import { GetByIdProductUseCase } from '../../application/use-cases/get-by-id-product.use-case';

@Controller('product')
export class ProductController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly getByIdProductUseCase: GetByIdProductUseCase,
  ) {}

  @Get(':id')
  getProductById() {
    return this.getByIdProductUseCase.execute({ id: 'some-id' });
  }

  @Get()
  findAll() {
    return 'All products';
  }

  @Post()
  create(@Body() createProductDto: any) {
    return this.createProductUseCase.execute(createProductDto);
  }

  @Put()
  updateProduct(@Body() updateProductDto: any) {
    return updateProductDto;
  }
}
