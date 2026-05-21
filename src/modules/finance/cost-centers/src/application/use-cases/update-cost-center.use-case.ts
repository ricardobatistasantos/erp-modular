import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { ICostCenterRepository } from '../../domain/repository/cost-center.interface.repository';
import { UpdateCostCenterDTO } from '../dto/update-cost-center.dto';
import { CostCenter } from '../../domain/entity/cost-center.entity';

export class UpdateCostCenterUseCase implements BaseUseCase<{ id: string; data: UpdateCostCenterDTO }, CostCenter> {
  constructor(
    @Inject('ICostCenterRepository')
    private readonly repository: ICostCenterRepository,
  ) {}

  async execute(input: { id: string; data: UpdateCostCenterDTO }): Promise<CostCenter> {
    const existingCostCenter = await this.repository.findById(input.id);

    if (!existingCostCenter) {
      throw new HttpException(
        'Centro de custo não encontrado',
        HttpStatus.NOT_FOUND,
      );
    }

    return this.repository.update(input.id, input.data);
  }
}
