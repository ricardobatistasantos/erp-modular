import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../../infra/databases/pg-promise/config.module';
import { PaymentMethodController } from './presentation/controllers/payment-method.controller';
import { PaymentMethodRepository } from './infra/repository/payment-method.repository';
import { CreatePaymentMethodUseCase } from './application/use-cases/create-payment-method.use-case';
import { GetByIdPaymentMethodUseCase } from './application/use-cases/get-by-id-payment-method.use-case';
import { FindAllPaymentMethodsUseCase } from './application/use-cases/find-all-payment-methods.use-case';
import { UpdatePaymentMethodUseCase } from './application/use-cases/update-payment-method.use-case';

@Module({
  imports: [DatabaseModule],
  controllers: [PaymentMethodController],
  providers: [
    { provide: 'IPaymentMethodRepository', useClass: PaymentMethodRepository },
    CreatePaymentMethodUseCase,
    GetByIdPaymentMethodUseCase,
    FindAllPaymentMethodsUseCase,
    UpdatePaymentMethodUseCase,
  ],
  exports: [
    CreatePaymentMethodUseCase,
    GetByIdPaymentMethodUseCase,
    FindAllPaymentMethodsUseCase,
    UpdatePaymentMethodUseCase,
  ],
})
export class PaymentMethodsModule {}
