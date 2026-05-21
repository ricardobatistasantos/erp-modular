import { Inject } from '@nestjs/common';
import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { IEmployeeRepository } from '../../domain/repository/enployee.interface.repository';
import { PaginationQueryDTO } from '../dto/pagination-query.dto';

export class FindAllEmployeesUseCase implements BaseUseCase<PaginationQueryDTO, any> {
  constructor(
    @Inject('IEmployeeRepository')
    private readonly employeeRepository: IEmployeeRepository,
  ) {}

  async execute(data: PaginationQueryDTO): Promise<any> {
    const page = data.page || 1;
    const limit = data.limit || 10;

    const result = await this.employeeRepository.findAll(page, limit);

    return {
      data: result.data,
      meta: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }
}
