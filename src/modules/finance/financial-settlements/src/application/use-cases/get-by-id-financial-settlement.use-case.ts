import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { FinancialSettlement } from '../../domain/entity/financial-settlement.entity';
import { IFinancialSettlementRepository } from '../../domain/repository/financial-settlement.interface.repository';

export class GetByIdFinancialSettlementUseCase implements BaseUseCase<{ id: string }, FinancialSettlement> {
  constructor(
    @Inject('IFinancialSettlementRepository')
    private readonly repository: IFinancialSettlementRepository,
  ) {}

  async execute(data: { id: string }): Promise<FinancialSettlement> {
    const settlement = await this.repository.findById(data.id);

    if (!settlement) {
      throw new HttpException(
        'Baixa financeira não encontrada',
        HttpStatus.NOT_FOUND,
      );
    }

    return settlement;
  }
}
