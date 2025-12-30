import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { CreateInventoryControlUseCase } from '../../application/use-cases/create-inventory-control.use-case';
import { GetByIdInventoryControlUseCase } from '../../application/use-cases/get-by-id-inventory-control.use-case';

@Controller('inventory-control')
export class InventoryControlController {
  constructor(
    private readonly createInventoryControlUseCase: CreateInventoryControlUseCase,
    private readonly getByIdInventoryControlUseCase: GetByIdInventoryControlUseCase,
  ) {}

  @Get(':id')
  getInventoryControlById() {
    return this.getByIdInventoryControlUseCase.execute({ id: 'some-id' });
  }

  @Get()
  findAll() {
    return 'All InventoryControls';
  }

  @Post()
  create(@Body() createInventoryControlDto: any) {
    return this.createInventoryControlUseCase.execute(
      createInventoryControlDto,
    );
  }

  @Put()
  updateInventoryControl(@Body() updateInventoryControlDto: any) {
    return updateInventoryControlDto;
  }
}
