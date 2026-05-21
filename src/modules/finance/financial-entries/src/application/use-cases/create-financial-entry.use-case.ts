import { HttpException, HttpStatus, Inject } from '@nestjs/common';

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
    if (!data.tipo || !data.origem || !data.origemId || !data.planoContaId || !data.dataLancamento || !data.descricao || !data.valor) {
      throw new HttpException(
        'Campos obrigatórios não informados: tipo, origem, origemId, planoContaId, dataLancamento, descricao e valor são obrigatórios',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (data.valor <= 0) {
      throw new HttpException(
        'O campo valor deve ser maior que zero',
        HttpStatus.BAD_REQUEST,
      );
    }

    const entryData: any = { ...data, saldoAnterior: null, saldoPosterior: null };

    return this.repository.create(entryData);
  }
}
