import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { ICostCenterRepository } from '../../domain/repository/cost-center.interface.repository';
import { CreateCostCenterDTO } from '../dto/create-cost-center.dto';
import { CostCenter } from '../../domain/entity/cost-center.entity';

export class CreateCostCenterUseCase implements BaseUseCase<CreateCostCenterDTO, CostCenter> {
  constructor(
    @Inject('ICostCenterRepository')
    private readonly repository: ICostCenterRepository,
  ) {}

  async execute(data: CreateCostCenterDTO): Promise<CostCenter> {
    const existingCostCenter = await this.repository.findByCodigo(data.codigo);

    if (existingCostCenter) {
      throw new HttpException(
        'Código já está em uso por outro centro de custo',
        HttpStatus.CONFLICT,
      );
    }

    if (data.centroPaiId) {
      const parentCostCenter = await this.repository.findById(data.centroPaiId);

      if (!parentCostCenter) {
        throw new HttpException(
          'Centro de custo pai não foi encontrado',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    return this.repository.create(data);
  }
}
