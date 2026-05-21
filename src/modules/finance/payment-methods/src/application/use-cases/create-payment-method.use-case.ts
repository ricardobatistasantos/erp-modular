import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { CreatePaymentMethodDTO } from '../dto/create-payment-method.dto';
import { PaymentMethod } from '../../domain/entity/payment-method.entity';
import { IPaymentMethodRepository } from '../../domain/repository/payment-method.interface.repository';

export class CreatePaymentMethodUseCase implements BaseUseCase<CreatePaymentMethodDTO, PaymentMethod> {
  constructor(
    @Inject('IPaymentMethodRepository')
    private readonly repository: IPaymentMethodRepository,
  ) {}

  async execute(data: CreatePaymentMethodDTO): Promise<PaymentMethod> {
    if (!data.nome || data.nome.trim() === '') {
      throw new HttpException(
        'O campo nome é obrigatório',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.repository.create(data);
  }
}
