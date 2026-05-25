import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { IBrandRepository } from '../../domain/repository/brand.interface.repository';
import { CreateBrandDTO } from '../dto/create-brand.dto';
import { Brand } from '../../domain/entity/brand.entity';

export class CreateBrandUseCase implements BaseUseCase<CreateBrandDTO, Brand> {
  constructor(
    @Inject('IBrandRepository')
    private readonly repository: IBrandRepository,
  ) {}

  async execute(data: CreateBrandDTO): Promise<Brand> {
    if (!data.nome || data.nome.trim() === '') {
      throw new HttpException(
        'O campo nome é obrigatório',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.repository.create(data);
  }
}
