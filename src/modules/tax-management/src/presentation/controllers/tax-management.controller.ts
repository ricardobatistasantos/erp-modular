import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { CreateTaxManagementUseCase } from '../../application/use-cases/create-tax-management.use-case';
import { GetByIdTaxManagementUseCase } from '../../application/use-cases/get-by-id-tax-management.use-case';

@Controller('tax-management')
export class TaxManagementController {
  constructor(
    private readonly createTaxManagementUseCase: CreateTaxManagementUseCase,
    private readonly getByIdTaxManagementUseCase: GetByIdTaxManagementUseCase,
  ) {}

  @Get(':id')
  getTaxManagementById() {
    return this.getByIdTaxManagementUseCase.execute({ id: 'some-id' });
  }

  @Get()
  findAll() {
    return 'All TaxManagements';
  }

  @Post()
  create(@Body() createTaxManagementDto: any) {
    return this.createTaxManagementUseCase.execute(createTaxManagementDto);
  }

  @Put()
  updateTaxManagement(@Body() updateTaxManagementDto: any) {
    return updateTaxManagementDto;
  }
}
