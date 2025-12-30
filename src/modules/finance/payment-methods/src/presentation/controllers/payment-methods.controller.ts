import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { CreatePaymentMethodsUseCase } from '../../application/use-cases/create-payment-methods.use-case';
import { GetByIdPaymentMethodsUseCase } from '../../application/use-cases/get-by-id-payment-methods.use-case';

@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(
    private readonly createPaymentMethodsUseCase: CreatePaymentMethodsUseCase,
    private readonly getByIdPaymentMethodsUseCase: GetByIdPaymentMethodsUseCase,
  ) {}

  @Get(':id')
  getPaymentMethodsById() {
    return this.getByIdPaymentMethodsUseCase.execute({ id: 'some-id' });
  }

  @Get()
  findAll() {
    return 'All PaymentMethodss';
  }

  @Post()
  create(@Body() createPaymentMethodsDto: any) {
    return this.createPaymentMethodsUseCase.execute(createPaymentMethodsDto);
  }

  @Put()
  updatePaymentMethods(@Body() createPaymentMethodsDto: any) {
    return createPaymentMethodsDto;
  }
}
