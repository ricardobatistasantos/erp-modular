import { Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { IClientRepository } from '../../domain/repository/client.interface.repository';
import { PaginationQueryDTO } from '../dto/pagination-query.dto';

export class FindAllClientsUseCase implements BaseUseCase<PaginationQueryDTO, any> {
  constructor(
    @Inject('IClientRepository')
    private readonly clientRepository: IClientRepository,
  ) {}

  async execute(data: PaginationQueryDTO): Promise<any> {
    const page = data.page || 1;
    const limit = data.limit || 10;

    const result = await this.clientRepository.findAll(page, limit);

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
