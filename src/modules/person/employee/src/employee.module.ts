import { Module } from '@nestjs/common';
import { EmployeeController } from './presentation/controllers/employee.controller';
import { CreateEmployeeUseCase } from './application/use-cases/create-employee.use-case';
import { GetByIdeEUseCase } from './application/use-cases/get-by-id-employee.use-case';
import { FindAllEmployeesUseCase } from './application/use-cases/find-all-employees.use-case';
import { EmployeeRepository } from './infra/repository/enployee.repository';
import { JobPositionRepository } from './infra/repository/job-position.repository';
import { DepartmentRepository } from './infra/repository/department.repository';
import { PersonRepository } from '@person/shared/infra/repository/person.repository';
import { PersonFisicaRepository } from '@person/shared/infra/repository/person-fisica.repository';
import { PersonJuridicaRepository } from '@person/shared/infra/repository/person-juridica.repository';
import { ContactRepository } from '@person/shared/infra/repository/person-contact.repository';
import { AddressRepository } from '@person/shared/infra/repository/person-address.repository';
import { RabbitMQModule } from 'src/infra/queue/queue.module';

@Module({
  imports: [RabbitMQModule],
  controllers: [EmployeeController],
  providers: [
    {
      provide: 'IEmployeeRepository',
      useClass: EmployeeRepository,
    },
    {
      provide: 'IPersonRepository',
      useClass: PersonRepository
    },
    {
      provide: 'IPersonFisicaRepository',
      useClass: PersonFisicaRepository
    },
    {
      provide: 'IPersonJuridicaRepository',
      useClass: PersonJuridicaRepository
    },
    {
      provide: 'IContactRepository',
      useClass: ContactRepository
    },
    {
      provide: 'IAddressRepository',
      useClass: AddressRepository
    },
    {
      provide: 'IJobPositionRepository',
      useClass: JobPositionRepository
    },
    {
      provide: 'IDepartmentRepository',
      useClass: DepartmentRepository
    },
    CreateEmployeeUseCase,
    GetByIdeEUseCase,
    FindAllEmployeesUseCase,
  ],
})
export class EmployeeModule { }
