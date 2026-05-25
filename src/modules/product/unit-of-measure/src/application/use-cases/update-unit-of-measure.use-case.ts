import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { IUnitOfMeasureRepository } from '../../domain/repository/unit-of-measure.interface.repository';
import { UpdateUnitOfMeasureDTO } from '../dto/update-unit-of-measure.dto';
import { UnitOfMeasure } from '../../domain/entity/unit-of-measure.entity';

export class UpdateUnitOfMeasureUseCase implements BaseUseCase<{ id: string; data: UpdateUnitOfMeasureDTO }, UnitOfMeasure> {
  constructor(
    @Inject('IUnitOfMeasureRepository')
    private readonly repository: IUnitOfMeasureRepository,
  ) {}

  async execute(input: { id: string; data: UpdateUnitOfMeasureDTO }): Promise<UnitOfMeasure> {
    const existingUnit = await this.repository.findById(input.id);

    if (!existingUnit) {
      throw new HttpException(
        'Unidade de medida não encontrada',
        HttpStatus.NOT_FOUND,
      );
    }

    return this.repository.update(input.id, input.data);
  }
}
