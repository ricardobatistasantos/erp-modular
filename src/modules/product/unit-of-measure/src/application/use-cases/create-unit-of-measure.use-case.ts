import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { IUnitOfMeasureRepository } from '../../domain/repository/unit-of-measure.interface.repository';
import { CreateUnitOfMeasureDTO } from '../dto/create-unit-of-measure.dto';
import { UnitOfMeasure } from '../../domain/entity/unit-of-measure.entity';

export class CreateUnitOfMeasureUseCase implements BaseUseCase<CreateUnitOfMeasureDTO, UnitOfMeasure> {
  constructor(
    @Inject('IUnitOfMeasureRepository')
    private readonly repository: IUnitOfMeasureRepository,
  ) {}

  async execute(data: CreateUnitOfMeasureDTO): Promise<UnitOfMeasure> {
    if (!data.sigla || data.sigla.trim() === '') {
      throw new HttpException(
        'O campo sigla é obrigatório',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!data.podeFracionar || !['S', 'N'].includes(data.podeFracionar)) {
      throw new HttpException(
        'O campo podeFracionar é obrigatório e deve ser S ou N',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.repository.create(data);
  }
}
