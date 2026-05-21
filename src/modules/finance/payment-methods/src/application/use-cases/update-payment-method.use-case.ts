import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { UpdatePaymentMethodDTO } from '../dto/update-payment-method.dto';
import { PaymentMethod } from '../../domain/entity/payment-method.entity';
import { IPaymentMethodRepository } from '../../domain/repository/payment-method.interface.repository';

export class UpdatePaymentMethodUseCase implements BaseUseCase<{ id: string; data: UpdatePaymentMethodDTO }, PaymentMethod> {
  constructor(
    @Inject('IPaymentMethodRepository')
    private readonly repository: IPaymentMethodRepository,
  ) {}

  async execute(input: { id: string; data: UpdatePaymentMethodDTO }): Promise<PaymentMethod> {
    const existing = await this.repository.findById(input.id);

    if (!existing) {
      throw new HttpException(
        'Forma de pagamento não encontrada',
        HttpStatus.NOT_FOUND,
      );
    }

    return this.repository.update(input.id, input.data);
  }
}
