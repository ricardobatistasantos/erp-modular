import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { FinancialEntry } from '../../domain/entity/financial-entry.entity';
import { IFinancialEntryRepository } from '../../domain/repository/financial-entry.interface.repository';

export class GetByIdFinancialEntryUseCase implements BaseUseCase<{ id: string }, FinancialEntry> {
  constructor(
    @Inject('IFinancialEntryRepository')
    private readonly repository: IFinancialEntryRepository,
  ) {}

  async execute(data: { id: string }): Promise<FinancialEntry> {
    const financialEntry = await this.repository.findById(data.id);

    if (!financialEntry) {
      throw new HttpException(
        'Lançamento financeiro não encontrado',
        HttpStatus.NOT_FOUND,
      );
    }

    return financialEntry;
  }
}
