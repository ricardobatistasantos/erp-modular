import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { GetByIdFinancialSettlementUseCase } from '../../application/use-cases/get-by-id-financial-settlement.use-case';
import { FindByParcelaIdFinancialSettlementUseCase } from '../../application/use-cases/find-by-parcela-id-financial-settlement.use-case';
import { SettleInstallmentUseCase } from '../../application/use-cases/settle-installment.use-case';
import { SettleInstallmentDTO } from '../../application/dto/settle-installment.dto';

@Controller('financial-settlements')
export class FinancialSettlementController {
  constructor(
    private readonly settleInstallmentUseCase: SettleInstallmentUseCase,
    private readonly getByIdFinancialSettlementUseCase: GetByIdFinancialSettlementUseCase,
    private readonly findByParcelaIdFinancialSettlementUseCase: FindByParcelaIdFinancialSettlementUseCase,
  ) {}

  @Get(':id')
  getFinancialSettlementById(@Param('id') id: string) {
    return this.getByIdFinancialSettlementUseCase.execute({ id });
  }

  @Get()
  findByParcelaId(@Query('parcelaId') parcelaId: string) {
    return this.findByParcelaIdFinancialSettlementUseCase.execute({ parcelaId });
  }

  @Post()
  create(@Body() settleInstallmentDto: SettleInstallmentDTO) {
    return this.settleInstallmentUseCase.execute(settleInstallmentDto);
  }
}
