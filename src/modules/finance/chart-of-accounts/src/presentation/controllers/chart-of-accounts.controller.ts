import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CreateChartOfAccountsUseCase } from '../../application/use-cases/create-chart-of-accounts.use-case';
import { GetByIdChartOfAccountsUseCase } from '../../application/use-cases/get-by-id-chart-of-accounts.use-case';
import { FindAllChartOfAccountsUseCase } from '../../application/use-cases/find-all-chart-of-accounts.use-case';
import { UpdateChartOfAccountsUseCase } from '../../application/use-cases/update-chart-of-accounts.use-case';
import { CreateChartOfAccountsDTO } from '../../application/dto/create-chart-of-accounts.dto';
import { UpdateChartOfAccountsDTO } from '../../application/dto/update-chart-of-accounts.dto';
import { PaginationQueryDTO } from '../../application/dto/pagination-query.dto';

@Controller('chart-of-accounts')
export class ChartOfAccountsController {
  constructor(
    private readonly createChartOfAccountsUseCase: CreateChartOfAccountsUseCase,
    private readonly getByIdChartOfAccountsUseCase: GetByIdChartOfAccountsUseCase,
    private readonly findAllChartOfAccountsUseCase: FindAllChartOfAccountsUseCase,
    private readonly updateChartOfAccountsUseCase: UpdateChartOfAccountsUseCase,
  ) {}

  @Post()
  create(@Body() createChartOfAccountsDto: CreateChartOfAccountsDTO) {
    return this.createChartOfAccountsUseCase.execute(createChartOfAccountsDto);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.getByIdChartOfAccountsUseCase.execute({ id });
  }

  @Get()
  findAll(@Query() query: PaginationQueryDTO) {
    return this.findAllChartOfAccountsUseCase.execute(query);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateChartOfAccountsDto: UpdateChartOfAccountsDTO) {
    return this.updateChartOfAccountsUseCase.execute({ id, data: updateChartOfAccountsDto });
  }
}
