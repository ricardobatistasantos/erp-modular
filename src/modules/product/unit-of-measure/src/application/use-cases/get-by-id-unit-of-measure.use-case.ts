import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { IUnitOfMeasureRepository } from '../../domain/repository/unit-of-measure.interface.repository';
import { UnitOfMeasure } from '../../domain/entity/unit-of-measure.entity';

export class GetByIdUnitOfMeasureUseCase implements BaseUseCase<{ id: string }, UnitOfMeasure> {
  constructor(
    @Inject('IUnitOfMeasureRepository')
    private readonly repository: IUnitOfMeasureRepository,
  ) {}

  async execute(data: { id: string }): Promise<UnitOfMeasure> {
    const unitOfMeasure = await this.repository.findById(data.id);

    if (!unitOfMeasure) {
      throw new HttpException(
        'Unidade de medida não encontrada',
        HttpStatus.NOT_FOUND,
      );
    }

    return unitOfMeasure;
  }
}
