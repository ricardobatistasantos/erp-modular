import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { CreateProcurementUseCase } from '../../application/use-cases/create-procurement.use-case';
import { GetByIdProcurementUseCase } from '../../application/use-cases/get-by-id-procurement.use-case';

@Controller('procurement')
export class ProcurementController {
  constructor(
    private readonly createProcurementUseCase: CreateProcurementUseCase,
    private readonly getByIdProcurementUseCase: GetByIdProcurementUseCase,
  ) {}

  @Get(':id')
  getProcurementById() {
    return this.getByIdProcurementUseCase.execute({ id: 'some-id' });
  }

  @Get()
  findAll() {
    return 'All Procurements';
  }

  @Post()
  create(@Body() createProcurementDto: any) {
    return this.createProcurementUseCase.execute(createProcurementDto);
  }

  @Put()
  updateProcurement(@Body() createProcurementDto: any) {
    return createProcurementDto;
  }
}
