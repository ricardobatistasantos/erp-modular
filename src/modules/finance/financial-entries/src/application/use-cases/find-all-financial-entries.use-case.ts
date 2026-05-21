import { Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { PaginationQueryDTO } from '../dto/pagination-query.dto';
import { FinancialEntry } from '../../domain/entity/financial-entry.entity';
import { IFinancialEntryRepository } from '../../domain/repository/financial-entry.interface.repository';

export class FindAllFinancialEntriesUseCase implements BaseUseCase<PaginationQueryDTO, any> {
  constructor(
    @Inject('IFinancialEntryRepository')
    private readonly repository: IFinancialEntryRepository,
  ) {}

  async execute(data: PaginationQueryDTO): Promise<any> {
    const page = data.page || 1;
    const limit = data.limit || 10;

    const result = await this.repository.findAll(page, limit);

    return {
      data: result.data,
      meta: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }
}
