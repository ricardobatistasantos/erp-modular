import { Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { CreateFinancialEntryDTO } from '../dto/create-financial-entry.dto';
import { FinancialEntry } from '../../domain/entity/financial-entry.entity';
import { IFinancialEntryRepository } from '../../domain/repository/financial-entry.interface.repository';

export class CreateFinancialEntryUseCase implements BaseUseCase<CreateFinancialEntryDTO, FinancialEntry> {
  constructor(
    @Inject('IFinancialEntryRepository')
    private readonly repository: IFinancialEntryRepository,
  ) {}

  async execute(data: CreateFinancialEntryDTO): Promise<FinancialEntry> {
    const entryData: any = { ...data, saldoAnterior: null, saldoPosterior: null };

    return this.repository.create(entryData);
  }
}
