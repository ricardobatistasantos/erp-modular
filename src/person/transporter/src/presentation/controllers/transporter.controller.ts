import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { CreateTransporterUseCase } from '../../application/use-cases/create-transporter.use-case';
import { GetByIdTransporterUseCase } from '../../application/use-cases/get-by-id-transporter.use-case';

@Controller('transporter')
export class TransporterController {
  constructor(
    private readonly createTransporterUseCase: CreateTransporterUseCase,
    private readonly getByIdTransporterUseCase: GetByIdTransporterUseCase,
  ) {}

  @Get(':id')
  getTransporterById() {
    return this.getByIdTransporterUseCase.execute({ id: 'some-id' });
  }

  @Get()
  findAll() {
    return 'All transporters';
  }

  @Post()
  create(@Body() createTransportersDto: any) {
    return this.createTransporterUseCase.execute(createTransportersDto);
  }

  @Put()
  updateTransporter(@Body() createTransportersDto: any) {
    return createTransportersDto;
  }
}
