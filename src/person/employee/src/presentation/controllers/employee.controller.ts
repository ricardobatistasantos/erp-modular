import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { CreateEmployeeUseCase } from '../../application/use-cases/create-employee.use-case';
import { GetByIdeEUseCase } from '../../application/use-cases/get-by-id-employee.use-case';

@Controller('employee')
export class EmployeeController {
  constructor(
    private readonly createEmployeeUseCase: CreateEmployeeUseCase,
    private readonly getByIdeEUseCase: GetByIdeEUseCase,
  ) {}

  @Get(':id')
  getEmployeeById() {
    return this.getByIdeEUseCase.execute({ id: 'some-id' });
  }

  @Get()
  findAll() {
    return 'All employee';
  }

  @Post()
  create(@Body() createEmployeeDto: any) {
    return this.createEmployeeUseCase.execute(createEmployeeDto);
  }

  @Put()
  updateEmployee(@Body() updateEmployeeDto: any) {
    return updateEmployeeDto;
  }
}
