import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CreateBrandUseCase } from '../../application/use-cases/create-brand.use-case';
import { GetByIdBrandUseCase } from '../../application/use-cases/get-by-id-brand.use-case';
import { FindAllBrandsUseCase } from '../../application/use-cases/find-all-brands.use-case';
import { UpdateBrandUseCase } from '../../application/use-cases/update-brand.use-case';
import { CreateBrandDTO } from '../../application/dto/create-brand.dto';
import { UpdateBrandDTO } from '../../application/dto/update-brand.dto';
import { PaginationQueryDTO } from '../../application/dto/pagination-query.dto';

@Controller('brand')
export class BrandController {
  constructor(
    private readonly createBrandUseCase: CreateBrandUseCase,
    private readonly getByIdBrandUseCase: GetByIdBrandUseCase,
    private readonly findAllBrandsUseCase: FindAllBrandsUseCase,
    private readonly updateBrandUseCase: UpdateBrandUseCase,
  ) {}

  @Post()
  create(@Body() createBrandDto: CreateBrandDTO) {
    return this.createBrandUseCase.execute(createBrandDto);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.getByIdBrandUseCase.execute({ id });
  }

  @Get()
  findAll(@Query() query: PaginationQueryDTO) {
    return this.findAllBrandsUseCase.execute(query);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateBrandDto: UpdateBrandDTO) {
    return this.updateBrandUseCase.execute({ id, data: updateBrandDto });
  }
}
