import { Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { ISupplierRepository } from '../../domain/repository/supplier.interface.repository';
import { PaginationQueryDTO } from '../dto/pagination-query.dto';

export class FindAllSuppliersUseCase implements BaseUseCase<PaginationQueryDTO, any> {
  constructor(
    @Inject('ISupplierRepository')
    private readonly supplierRepository: ISupplierRepository,
  ) {}

  async execute(data: PaginationQueryDTO): Promise<any> {
    const page = data.page || 1;
    const limit = data.limit || 10;

    const result = await this.supplierRepository.findAll(page, limit);

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
