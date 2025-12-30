import { Module } from '@nestjs/common';
import { PaymentMethodsController } from './presentation/controllers/payment-methods.controller';
import { CreatePaymentMethodsUseCase } from './application/use-cases/create-payment-methods.use-case';
import { GetByIdPaymentMethodsUseCase } from './application/use-cases/get-by-id-payment-methods.use-case';

@Module({
  imports: [],
  controllers: [PaymentMethodsController],
  providers: [CreatePaymentMethodsUseCase, GetByIdPaymentMethodsUseCase],
})
export class PaymentMethodsModule {}
