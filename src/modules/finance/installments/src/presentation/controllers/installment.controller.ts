import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CreateInstallmentUseCase } from '../../application/use-cases/create-installment.use-case';
import { GetByIdInstallmentUseCase } from '../../application/use-cases/get-by-id-installment.use-case';
import { FindByOrigemIdInstallmentUseCase } from '../../application/use-cases/find-by-origem-id-installment.use-case';
import { CreateInstallmentDTO } from '../../application/dto/create-installment.dto';

@Controller('installments')
export class InstallmentController {
  constructor(
    private readonly createInstallmentUseCase: CreateInstallmentUseCase,
    private readonly getByIdInstallmentUseCase: GetByIdInstallmentUseCase,
    private readonly findByOrigemIdInstallmentUseCase: FindByOrigemIdInstallmentUseCase,
  ) {}

  @Post()
  create(@Body() createInstallmentDto: CreateInstallmentDTO) {
    return this.createInstallmentUseCase.execute(createInstallmentDto);
  }

  @Get(':id')
  getInstallmentById(@Param('id') id: string) {
    return this.getByIdInstallmentUseCase.execute({ id });
  }

  @Get()
  findByOrigemId(@Query('origemId') origemId: string) {
    return this.findByOrigemIdInstallmentUseCase.execute({ origemId });
  }
}
