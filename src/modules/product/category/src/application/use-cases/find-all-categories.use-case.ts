import { Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { ICategoryRepository } from '../../domain/repository/category.interface.repository';
import { PaginationQueryDTO } from '../dto/pagination-query.dto';
import { Category } from '../../domain/entity/category.entity';

export class FindAllCategoriesUseCase implements BaseUseCase<PaginationQueryDTO, any> {
  constructor(
    @Inject('ICategoryRepository')
    private readonly repository: ICategoryRepository,
  ) {}

  async execute(data: PaginationQueryDTO): Promise<{
    data: Category[];
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
