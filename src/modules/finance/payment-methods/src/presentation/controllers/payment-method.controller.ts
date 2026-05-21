import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CreatePaymentMethodUseCase } from '../../application/use-cases/create-payment-method.use-case';
import { GetByIdPaymentMethodUseCase } from '../../application/use-cases/get-by-id-payment-method.use-case';
import { FindAllPaymentMethodsUseCase } from '../../application/use-cases/find-all-payment-methods.use-case';
import { UpdatePaymentMethodUseCase } from '../../application/use-cases/update-payment-method.use-case';
import { CreatePaymentMethodDTO } from '../../application/dto/create-payment-method.dto';
import { UpdatePaymentMethodDTO } from '../../application/dto/update-payment-method.dto';
import { PaginationQueryDTO } from '../../application/dto/pagination-query.dto';

@Controller('payment-methods')
export class PaymentMethodController {
  constructor(
    private readonly createPaymentMethodUseCase: CreatePaymentMethodUseCase,
    private readonly getByIdPaymentMethodUseCase: GetByIdPaymentMethodUseCase,
    private readonly findAllPaymentMethodsUseCase: FindAllPaymentMethodsUseCase,
    private readonly updatePaymentMethodUseCase: UpdatePaymentMethodUseCase,
  ) {}

  @Post()
  create(@Body() createPaymentMethodDto: CreatePaymentMethodDTO) {
    return this.createPaymentMethodUseCase.execute(createPaymentMethodDto);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.getByIdPaymentMethodUseCase.execute({ id });
  }

  @Get()
  findAll(@Query() query: PaginationQueryDTO) {
    return this.findAllPaymentMethodsUseCase.execute(query);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updatePaymentMethodDto: UpdatePaymentMethodDTO) {
    return this.updatePaymentMethodUseCase.execute({ id, data: updatePaymentMethodDto });
  }
}
