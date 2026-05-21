import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CreateCostCenterUseCase } from '../../application/use-cases/create-cost-center.use-case';
import { GetByIdCostCenterUseCase } from '../../application/use-cases/get-by-id-cost-center.use-case';
import { FindAllCostCentersUseCase } from '../../application/use-cases/find-all-cost-centers.use-case';
import { UpdateCostCenterUseCase } from '../../application/use-cases/update-cost-center.use-case';
import { CreateCostCenterDTO } from '../../application/dto/create-cost-center.dto';
import { UpdateCostCenterDTO } from '../../application/dto/update-cost-center.dto';
import { PaginationQueryDTO } from '../../application/dto/pagination-query.dto';

@Controller('cost-centers')
export class CostCenterController {
  constructor(
    private readonly createCostCenterUseCase: CreateCostCenterUseCase,
    private readonly getByIdCostCenterUseCase: GetByIdCostCenterUseCase,
    private readonly findAllCostCentersUseCase: FindAllCostCentersUseCase,
    private readonly updateCostCenterUseCase: UpdateCostCenterUseCase,
  ) {}

  @Post()
  create(@Body() createCostCenterDto: CreateCostCenterDTO) {
    return this.createCostCenterUseCase.execute(createCostCenterDto);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.getByIdCostCenterUseCase.execute({ id });
  }

  @Get()
  findAll(@Query() query: PaginationQueryDTO) {
    return this.findAllCostCentersUseCase.execute(query);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateCostCenterDto: UpdateCostCenterDTO) {
    return this.updateCostCenterUseCase.execute({ id, data: updateCostCenterDto });
  }
}
