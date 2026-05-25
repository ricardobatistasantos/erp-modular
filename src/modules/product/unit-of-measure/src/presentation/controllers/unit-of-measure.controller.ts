import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CreateUnitOfMeasureUseCase } from '../../application/use-cases/create-unit-of-measure.use-case';
import { GetByIdUnitOfMeasureUseCase } from '../../application/use-cases/get-by-id-unit-of-measure.use-case';
import { FindAllUnitsOfMeasureUseCase } from '../../application/use-cases/find-all-units-of-measure.use-case';
import { UpdateUnitOfMeasureUseCase } from '../../application/use-cases/update-unit-of-measure.use-case';
import { CreateUnitOfMeasureDTO } from '../../application/dto/create-unit-of-measure.dto';
import { UpdateUnitOfMeasureDTO } from '../../application/dto/update-unit-of-measure.dto';
import { PaginationQueryDTO } from '../../application/dto/pagination-query.dto';

@Controller('unit-of-measure')
export class UnitOfMeasureController {
  constructor(
    private readonly createUnitOfMeasureUseCase: CreateUnitOfMeasureUseCase,
    private readonly getByIdUnitOfMeasureUseCase: GetByIdUnitOfMeasureUseCase,
    private readonly findAllUnitsOfMeasureUseCase: FindAllUnitsOfMeasureUseCase,
    private readonly updateUnitOfMeasureUseCase: UpdateUnitOfMeasureUseCase,
  ) {}

  @Post()
  create(@Body() createUnitOfMeasureDto: CreateUnitOfMeasureDTO) {
    return this.createUnitOfMeasureUseCase.execute(createUnitOfMeasureDto);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.getByIdUnitOfMeasureUseCase.execute({ id });
  }

  @Get()
  findAll(@Query() query: PaginationQueryDTO) {
    return this.findAllUnitsOfMeasureUseCase.execute(query);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateUnitOfMeasureDto: UpdateUnitOfMeasureDTO) {
    return this.updateUnitOfMeasureUseCase.execute({ id, data: updateUnitOfMeasureDto });
  }
}
