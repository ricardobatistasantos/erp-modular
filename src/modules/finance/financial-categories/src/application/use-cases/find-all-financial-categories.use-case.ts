import { Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { IFinancialCategoryRepository } from '../../domain/repository/financial-category.interface.repository';
import { PaginationQueryDTO } from '../dto/pagination-query.dto';
import { FinancialCategory } from '../../domain/entity/financial-category.entity';

export class FindAllFinancialCategoriesUseCase
  implements BaseUseCase<PaginationQueryDTO, any>
{
  constructor(
    @Inject('IFinancialCategoryRepository')
    private readonly repository: IFinancialCategoryRepository,
  ) {}

  async execute(data: PaginationQueryDTO): Promise<{
    data: FinancialCategory[];
    meta: { totalItems: number; page: number; limit: number; totalPages: number };
  }> {
    let page = data.page && data.page >= 1 ? data.page : 1;
    let limit = data.limit && data.limit >= 1 && data.limit <= 100 ? data.limit : 10;

    const result = await this.repository.findAll(page, limit);

    return {
      data: result.data,
      meta: {
        totalItems: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }
}
