import { Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { PaginationQueryDTO } from '../dto/pagination-query.dto';
import { Bank } from '../../domain/entity/bank.entity';
import { IBankRepository } from '../../domain/repository/bank.interface.repository';

export class FindAllBanksUseCase implements BaseUseCase<PaginationQueryDTO, any> {
  constructor(
    @Inject('IBankRepository')
    private readonly repository: IBankRepository,
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
