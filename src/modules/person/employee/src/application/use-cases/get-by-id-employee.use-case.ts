import { Inject, NotFoundException } from '@nestjs/common';
import { IEmployeeRepository } from '../../domain/repository/enployee.interface.repository';
import { BaseUseCase } from '../../domain/use-case/base.use-case';

export class GetByIdeEUseCase implements BaseUseCase<any, any> {
  constructor(
    @Inject('IEmployeeRepository')
    private readonly employeeRepository: IEmployeeRepository,
  ) {}

  async execute(data: { id: string }): Promise<any> {
    const employee = await this.employeeRepository.findById(data.id);

    if (!employee) {
      throw new NotFoundException(`Colaborador com id ${data.id} não encontrado`);
    }

    return employee;
  }
}
