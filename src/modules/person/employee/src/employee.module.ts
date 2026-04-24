import { Module } from '@nestjs/common';
import { EmployeeController } from './presentation/controllers/employee.controller';
import { CreateEmployeeUseCase } from './application/use-cases/create-employee.use-case';
import { GetByIdeEUseCase } from './application/use-cases/get-by-id-employee.use-case';
import { EmployeeRepository } from './infra/repository/enployee.repository';

@Module({
  imports: [],
  controllers: [EmployeeController],
  providers: [
    {
      provide: 'IEmployeeRepository',
      useClass: EmployeeRepository,
    },
    CreateEmployeeUseCase,
    GetByIdeEUseCase
  ],
})
export class EmployeeModule { }
