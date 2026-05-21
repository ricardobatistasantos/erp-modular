import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { PaymentMethod } from '../../domain/entity/payment-method.entity';
import { IPaymentMethodRepository } from '../../domain/repository/payment-method.interface.repository';

export class GetByIdPaymentMethodUseCase implements BaseUseCase<{ id: string }, PaymentMethod> {
  constructor(
    @Inject('IPaymentMethodRepository')
    private readonly repository: IPaymentMethodRepository,
  ) {}

  async execute(data: { id: string }): Promise<PaymentMethod> {
    const paymentMethod = await this.repository.findById(data.id);

    if (!paymentMethod) {
      throw new HttpException(
        'Forma de pagamento não encontrada',
        HttpStatus.NOT_FOUND,
      );
    }

    return paymentMethod;
  }
}
