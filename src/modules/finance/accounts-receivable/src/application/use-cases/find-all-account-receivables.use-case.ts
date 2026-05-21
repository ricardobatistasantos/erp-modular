import { Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { PaginationQueryDTO } from '../dto/pagination-query.dto';
import { AccountReceivable } from '../../domain/entity/account-receivable.entity';
import { IAccountReceivableRepository } from '../../domain/repository/account-receivable.interface.repository';

export class FindAllAccountReceivablesUseCase implements BaseUseCase<PaginationQueryDTO, any> {
  constructor(
    @Inject('IAccountReceivableRepository')
    private readonly repository: IAccountReceivableRepository,
  ) {}

  async execute(data: PaginationQueryDTO): Promise<{
    data: AccountReceivable[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
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
