import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CreateFinancialSettlementUseCase } from '../../application/use-cases/create-financial-settlement.use-case';
import { GetByIdFinancialSettlementUseCase } from '../../application/use-cases/get-by-id-financial-settlement.use-case';
import { FindByContaIdFinancialSettlementUseCase } from '../../application/use-cases/find-by-conta-id-financial-settlement.use-case';
import { CreateFinancialSettlementDTO } from '../../application/dto/create-financial-settlement.dto';

@Controller('financial-settlements')
export class FinancialSettlementController {
  constructor(
    private readonly createFinancialSettlementUseCase: CreateFinancialSettlementUseCase,
    private readonly getByIdFinancialSettlementUseCase: GetByIdFinancialSettlementUseCase,
    private readonly findByContaIdFinancialSettlementUseCase: FindByContaIdFinancialSettlementUseCase,
  ) {}

  @Get(':id')
  getFinancialSettlementById(@Param('id') id: string) {
    return this.getByIdFinancialSettlementUseCase.execute({ id });
  }

  @Get()
  findByContaId(@Query('contaId') contaId: string) {
    return this.findByContaIdFinancialSettlementUseCase.execute({ contaId });
  }

  @Post()
  create(@Body() createFinancialSettlementDto: CreateFinancialSettlementDTO) {
    return this.createFinancialSettlementUseCase.execute(createFinancialSettlementDto);
  }
}
