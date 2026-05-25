import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { ICategoryRepository } from '../../domain/repository/category.interface.repository';
import { CreateCategoryDTO } from '../dto/create-category.dto';
import { Category } from '../../domain/entity/category.entity';

export class CreateCategoryUseCase implements BaseUseCase<CreateCategoryDTO, Category> {
  constructor(
    @Inject('ICategoryRepository')
    private readonly repository: ICategoryRepository,
  ) {}

  async execute(data: CreateCategoryDTO): Promise<Category> {
    if (!data.nome || data.nome.trim() === '') {
      throw new HttpException(
        'O campo nome é obrigatório',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.repository.create(data);
  }
}
