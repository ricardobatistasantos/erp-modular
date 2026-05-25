import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { IBrandRepository } from '../../domain/repository/brand.interface.repository';
import { Brand } from '../../domain/entity/brand.entity';

export class GetByIdBrandUseCase implements BaseUseCase<{ id: string }, Brand> {
  constructor(
    @Inject('IBrandRepository')
    private readonly repository: IBrandRepository,
  ) {}

  async execute(data: { id: string }): Promise<Brand> {
    const brand = await this.repository.findById(data.id);

    if (!brand) {
      throw new HttpException(
        'Marca de produto não encontrada',
        HttpStatus.NOT_FOUND,
      );
    }

    return brand;
  }
}
