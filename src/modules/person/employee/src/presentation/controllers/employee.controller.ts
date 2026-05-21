import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CreateEmployeeUseCase } from '../../application/use-cases/create-employee.use-case';
import { GetByIdeEUseCase } from '../../application/use-cases/get-by-id-employee.use-case';
import { FindAllEmployeesUseCase } from '../../application/use-cases/find-all-employees.use-case';
import { CreateEmployeeDTO } from '../../application/dto/create-employee.dto';
import { PaginationQueryDTO } from '../../application/dto/pagination-query.dto';

@Controller('employee')
export class EmployeeController {
  constructor(
    private readonly createEmployeeUseCase: CreateEmployeeUseCase,
    private readonly getByIdeEUseCase: GetByIdeEUseCase,
    private readonly findAllEmployeesUseCase: FindAllEmployeesUseCase,
  ) {}

  @Get(':id')
  getEmployeeById(@Param('id') id: string) {
    return this.getByIdeEUseCase.execute({ id });
  }

  @Get()
  findAll(@Query() query: PaginationQueryDTO) {
    return this.findAllEmployeesUseCase.execute(query);
  }

  @Post()
  create(@Body() createEmployeeDto: CreateEmployeeDTO) {
    return this.createEmployeeUseCase.execute(createEmployeeDto);
  }

  @Put()
  updateEmployee(@Body() updateEmployeeDto: any) {
    return updateEmployeeDto;
  }
}
