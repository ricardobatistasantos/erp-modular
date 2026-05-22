import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateInstallmentUseCase } from '../../application/use-cases/create-installment.use-case';
import { GetByIdInstallmentUseCase } from '../../application/use-cases/get-by-id-installment.use-case';
import { FindByOrigemIdInstallmentUseCase } from '../../application/use-cases/find-by-origem-id-installment.use-case';
import { GenerateInstallmentsUseCase } from '../../application/use-cases/generate-installments.use-case';
import { CancelInstallmentUseCase } from '../../application/use-cases/cancel-installment.use-case';
import { CreateInstallmentDTO } from '../../application/dto/create-installment.dto';
import { GenerateInstallmentsDTO } from '../../application/dto/generate-installments.dto';

@Controller('installments')
export class InstallmentController {
  constructor(
    private readonly createInstallmentUseCase: CreateInstallmentUseCase,
    private readonly getByIdInstallmentUseCase: GetByIdInstallmentUseCase,
    private readonly findByOrigemIdInstallmentUseCase: FindByOrigemIdInstallmentUseCase,
    private readonly generateInstallmentsUseCase: GenerateInstallmentsUseCase,
    private readonly cancelInstallmentUseCase: CancelInstallmentUseCase,
  ) {}

  @Post()
  create(@Body() createInstallmentDto: CreateInstallmentDTO) {
    return this.createInstallmentUseCase.execute(createInstallmentDto);
  }

  @Post('generate')
  generate(@Body() generateInstallmentsDto: GenerateInstallmentsDTO) {
    return this.generateInstallmentsUseCase.execute(generateInstallmentsDto);
  }

  @Get(':id')
  getInstallmentById(@Param('id') id: string) {
    return this.getByIdInstallmentUseCase.execute({ id });
  }

  @Get()
  findByOrigemId(@Query('origemId') origemId: string) {
    return this.findByOrigemIdInstallmentUseCase.execute({ origemId });
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.cancelInstallmentUseCase.execute({ parcelaId: id });
  }
}
