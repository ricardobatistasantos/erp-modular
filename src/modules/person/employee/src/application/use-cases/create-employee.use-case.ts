import { Inject } from '@nestjs/common';
import { IEmployeeRepository } from '../../domain/repository/enployee.interface.repository';
import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { CreateEmployeeDTO } from '../dto/create-employee.dto';

export class CreateEmployeeUseCase implements BaseUseCase<CreateEmployeeDTO, any> {

  constructor(
    @Inject('IEmployeeRepository')
    private readonly employeeRepository: IEmployeeRepository
  ) {}

  async execute(data: CreateEmployeeDTO) {
    return await this.employeeRepository.create(data);
  }
}
