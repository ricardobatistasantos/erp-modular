import { Body, Controller, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { CreateInstallmentUseCase } from '../../application/use-cases/create-installment.use-case';
import { GetByIdInstallmentUseCase } from '../../application/use-cases/get-by-id-installment.use-case';
import { FindInstallmentsByOrigemUseCase } from '../../application/use-cases/find-installments-by-origem.use-case';
import { GenerateInstallmentsUseCase } from '../../application/use-cases/generate-installments.use-case';
import { CancelInstallmentUseCase } from '../../application/use-cases/cancel-installment.use-case';
import { RecalculateInstallmentsUseCase } from '../../application/use-cases/recalculate-installments.use-case';
import { RegenerateInstallmentsUseCase } from '../../application/use-cases/regenerate-installments.use-case';
import { CreateInstallmentDTO } from '../../application/dto/create-installment.dto';
import { GenerateInstallmentsDTO } from '../../application/dto/generate-installments.dto';
import { RecalculateInstallmentsDTO } from '../../application/dto/recalculate-installments.dto';
import { RegenerateInstallmentsDTO } from '../../application/dto/regenerate-installments.dto';

@Controller('installments')
export class InstallmentController {
  constructor(
    private readonly createInstallmentUseCase: CreateInstallmentUseCase,
    private readonly getByIdInstallmentUseCase: GetByIdInstallmentUseCase,
    private readonly findInstallmentsByOrigemUseCase: FindInstallmentsByOrigemUseCase,
    private readonly generateInstallmentsUseCase: GenerateInstallmentsUseCase,
    private readonly cancelInstallmentUseCase: CancelInstallmentUseCase,
    private readonly recalculateInstallmentsUseCase: RecalculateInstallmentsUseCase,
    private readonly regenerateInstallmentsUseCase: RegenerateInstallmentsUseCase,
  ) {}

  @Post()
  create(@Body() createInstallmentDto: CreateInstallmentDTO) {
    return this.createInstallmentUseCase.execute(createInstallmentDto);
  }

  @Post('generate')
  generate(@Body() generateInstallmentsDto: GenerateInstallmentsDTO) {
    return this.generateInstallmentsUseCase.execute(generateInstallmentsDto);
  }

  @Put('recalculate')
  recalculate(@Body() recalculateDto: RecalculateInstallmentsDTO) {
    return this.recalculateInstallmentsUseCase.execute(recalculateDto);
  }

  @Put('regenerate')
  regenerate(@Body() regenerateDto: RegenerateInstallmentsDTO) {
    return this.regenerateInstallmentsUseCase.execute(regenerateDto);
  }

  @Get(':id')
  getInstallmentById(@Param('id') id: string) {
    return this.getByIdInstallmentUseCase.execute({ id });
  }

  @Get()
  findByOrigemId(@Query('origemId') origemId: string) {
    return this.findInstallmentsByOrigemUseCase.execute({ origemId });
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.cancelInstallmentUseCase.execute({ parcelaId: id });
  }
}
