import { Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { PaginationQueryDTO } from '../dto/pagination-query.dto';
import { AccountPayable } from '../../domain/entity/account-payable.entity';
import { IAccountPayableRepository } from '../../domain/repository/account-payable.interface.repository';

export class FindAllAccountPayablesUseCase implements BaseUseCase<PaginationQueryDTO, any> {
  constructor(
    @Inject('IAccountPayableRepository')
    private readonly repository: IAccountPayableRepository,
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
