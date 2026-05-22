import { Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { PaginationQueryDTO } from '../dto/pagination-query.dto';
import { BankAgency } from '../../domain/entity/bank-agency.entity';
import { IBankAgencyRepository } from '../../domain/repository/bank-agency.interface.repository';

export class FindAllBankAgenciesUseCase implements BaseUseCase<PaginationQueryDTO, any> {
  constructor(
    @Inject('IBankAgencyRepository')
    private readonly repository: IBankAgencyRepository,
  ) {}

  async execute(data: PaginationQueryDTO): Promise<any> {
    const page = data.page || 1;
    const limit = data.limit || 10;
    const bancoId = data.bancoId;

    const result = await this.repository.findAll(page, limit, bancoId);

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
