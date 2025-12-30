import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { CreateSupplierUseCase } from '../../application/use-cases/create-supplier.use-case';
import { GetByIdSupplierUseCase } from '../../application/use-cases/get-by-id-supplier.use-case';

@Controller('supplier')
export class SupplierController {
  constructor(
    private readonly createSupplierUseCase: CreateSupplierUseCase,
    private readonly getByIdSupplierUseCase: GetByIdSupplierUseCase,
  ) {}

  @Get(':id')
  getSupplierById() {
    return this.getByIdSupplierUseCase.execute({ id: 'some-id' });
  }

  @Get()
  findAll() {
    return 'All suppliers';
  }

  @Post()
  create(@Body() createSupplierDto: any) {
    return this.createSupplierUseCase.execute(createSupplierDto);
  }

  @Put()
  updateSupplier(@Body() createSupplierDto: any) {
    return createSupplierDto;
  }
}
