import { Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { IChartOfAccountsRepository } from '../../domain/repository/chart-of-accounts.interface.repository';
import { PaginationQueryDTO } from '../dto/pagination-query.dto';
import { ChartOfAccounts } from '../../domain/entity/chart-of-accounts.entity';

export class FindAllChartOfAccountsUseCase
  implements BaseUseCase<PaginationQueryDTO, any>
{
  constructor(
    @Inject('IChartOfAccountsRepository')
    private readonly repository: IChartOfAccountsRepository,
  ) {}

  async execute(data: PaginationQueryDTO): Promise<{
    data: ChartOfAccounts[];
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
