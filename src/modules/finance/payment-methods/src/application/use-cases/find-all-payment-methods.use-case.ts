import { Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { PaginationQueryDTO } from '../dto/pagination-query.dto';
import { PaymentMethod } from '../../domain/entity/payment-method.entity';
import { IPaymentMethodRepository } from '../../domain/repository/payment-method.interface.repository';

export class FindAllPaymentMethodsUseCase implements BaseUseCase<PaginationQueryDTO, any> {
  constructor(
    @Inject('IPaymentMethodRepository')
    private readonly repository: IPaymentMethodRepository,
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
