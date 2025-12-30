import { Module } from '@nestjs/common';
import { EmployeeController } from './presentation/controllers/employee.controller';
import { CreateEmployeeUseCase } from './application/use-cases/create-employee.use-case';
import { GetByIdeEUseCase } from './application/use-cases/get-by-id-employee.use-case';

@Module({
  imports: [],
  controllers: [EmployeeController],
  providers: [CreateEmployeeUseCase, GetByIdeEUseCase],
})
export class EmployeeModule {}
