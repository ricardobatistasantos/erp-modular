import { Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { PaginationQueryDTO } from '../dto/pagination-query.dto';
import { BankAccount } from '../../domain/entity/bank-account.entity';
import { IBankAccountRepository } from '../../domain/repository/bank-account.interface.repository';

export class FindAllBankAccountsUseCase implements BaseUseCase<PaginationQueryDTO, any> {
  constructor(
    @Inject('IBankAccountRepository')
    private readonly repository: IBankAccountRepository,
  ) {}

  async execute(data: PaginationQueryDTO): Promise<any> {
    const page = data.page || 1;
    const limit = data.limit || 10;
    const bancoAgenciaId = data.bancoAgenciaId;

    const result = await this.repository.findAll(page, limit, bancoAgenciaId);

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
