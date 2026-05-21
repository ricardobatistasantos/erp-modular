import { Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { FinancialSettlement } from '../../domain/entity/financial-settlement.entity';
import { IFinancialSettlementRepository } from '../../domain/repository/financial-settlement.interface.repository';

export class FindByContaIdFinancialSettlementUseCase implements BaseUseCase<{ contaId: string }, FinancialSettlement[]> {
  constructor(
    @Inject('IFinancialSettlementRepository')
    private readonly repository: IFinancialSettlementRepository,
  ) {}

  async execute(data: { contaId: string }): Promise<FinancialSettlement[]> {
    return this.repository.findByContaId(data.contaId);
  }
}
