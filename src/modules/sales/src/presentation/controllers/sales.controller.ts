import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { CreateSalesUseCase } from '../../application/use-cases/create-sales.use-case';
import { GetByIdSalesUseCase } from '../../application/use-cases/get-by-id-sales.use-case';

@Controller('sales')
export class SalesController {
  constructor(
    private readonly createSalesUseCase: CreateSalesUseCase,
    private readonly getByIdSalesUseCase: GetByIdSalesUseCase,
  ) {}

  @Get(':id')
  getSalesById() {
    return this.getByIdSalesUseCase.execute({ id: 'some-id' });
  }

  @Get()
  findAll() {
    return 'All Saless';
  }

  @Post()
  create(@Body() createSalesDto: any) {
    return this.createSalesUseCase.execute(createSalesDto);
  }

  @Put()
  updateSales(@Body() createSalesDto: any) {
    return createSalesDto;
  }
}
