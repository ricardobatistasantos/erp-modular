import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { CreateCashFlowUseCase } from '../../application/use-cases/create-cash-flow.use-case';
import { GetByIdCashFlowUseCase } from '../../application/use-cases/get-by-id-cash-flow.use-case';

@Controller('cash-flow')
export class CashFlowController {
  constructor(
    private readonly createCashFlowUseCase: CreateCashFlowUseCase,
    private readonly getByIdCashFlowUseCase: GetByIdCashFlowUseCase,
  ) {}

  @Get(':id')
  getCashFlowById() {
    return this.getByIdCashFlowUseCase.execute({ id: 'some-id' });
  }

  @Get()
  findAll() {
    return 'All CashFlows';
  }

  @Post()
  create(@Body() createCashFlowDto: any) {
    return this.createCashFlowUseCase.execute(createCashFlowDto);
  }

  @Put()
  updateCashFlow(@Body() createCashFlowDto: any) {
    return createCashFlowDto;
  }
}
