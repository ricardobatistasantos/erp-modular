import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { ICostCenterRepository } from '../../domain/repository/cost-center.interface.repository';
import { CostCenter } from '../../domain/entity/cost-center.entity';

export class GetByIdCostCenterUseCase implements BaseUseCase<{ id: string }, CostCenter> {
  constructor(
    @Inject('ICostCenterRepository')
    private readonly repository: ICostCenterRepository,
  ) {}

  async execute(data: { id: string }): Promise<CostCenter> {
    const costCenter = await this.repository.findById(data.id);

    if (!costCenter) {
      throw new HttpException(
        'Centro de custo não encontrado',
        HttpStatus.NOT_FOUND,
      );
    }

    return costCenter;
  }
}
