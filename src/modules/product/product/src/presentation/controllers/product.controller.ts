import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CreateProductUseCase } from '../../application/use-cases/create-product.use-case';
import { GetByIdProductUseCase } from '../../application/use-cases/get-by-id-product.use-case';
import { FindAllProductsUseCase } from '../../application/use-cases/find-all-products.use-case';
import { UpdateProductUseCase } from '../../application/use-cases/update-product.use-case';
import { CreateProductDTO } from '../../application/dto/create-product.dto';
import { UpdateProductDTO } from '../../application/dto/update-product.dto';
import { PaginationQueryDTO } from '../../application/dto/pagination-query.dto';

@Controller('product')
export class ProductController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly getByIdProductUseCase: GetByIdProductUseCase,
    private readonly findAllProductsUseCase: FindAllProductsUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
  ) {}

  @Post()
  create(@Body() createProductDto: CreateProductDTO) {
    return this.createProductUseCase.execute(createProductDto);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.getByIdProductUseCase.execute({ id });
  }

  @Get()
  findAll(@Query() query: PaginationQueryDTO) {
    return this.findAllProductsUseCase.execute(query);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDTO) {
    return this.updateProductUseCase.execute({ id, data: updateProductDto });
  }
}
