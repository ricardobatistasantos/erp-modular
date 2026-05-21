import { Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { ICostCenterRepository } from '../../domain/repository/cost-center.interface.repository';
import { PaginationQueryDTO } from '../dto/pagination-query.dto';
import { CostCenter } from '../../domain/entity/cost-center.entity';

export class FindAllCostCentersUseCase implements BaseUseCase<PaginationQueryDTO, any> {
  constructor(
    @Inject('ICostCenterRepository')
    private readonly repository: ICostCenterRepository,
  ) {}

  async execute(data: PaginationQueryDTO): Promise<{
    data: CostCenter[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const page = data.page && data.page >= 1 ? data.page : 1;
    const limit = data.limit && data.limit >= 1 && data.limit <= 100 ? data.limit : 10;

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
