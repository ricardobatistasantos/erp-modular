import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { IBrandRepository } from '../../domain/repository/brand.interface.repository';
import { UpdateBrandDTO } from '../dto/update-brand.dto';
import { Brand } from '../../domain/entity/brand.entity';

export class UpdateBrandUseCase implements BaseUseCase<{ id: string; data: UpdateBrandDTO }, Brand> {
  constructor(
    @Inject('IBrandRepository')
    private readonly repository: IBrandRepository,
  ) {}

  async execute(input: { id: string; data: UpdateBrandDTO }): Promise<Brand> {
    const existingBrand = await this.repository.findById(input.id);

    if (!existingBrand) {
      throw new HttpException(
        'Marca de produto não encontrada',
        HttpStatus.NOT_FOUND,
      );
    }

    return this.repository.update(input.id, input.data);
  }
}
