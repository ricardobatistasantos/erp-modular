import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { ICategoryRepository } from '../../domain/repository/category.interface.repository';
import { Category } from '../../domain/entity/category.entity';

export class GetByIdCategoryUseCase implements BaseUseCase<{ id: string }, Category> {
  constructor(
    @Inject('ICategoryRepository')
    private readonly repository: ICategoryRepository,
  ) {}

  async execute(data: { id: string }): Promise<Category> {
    const category = await this.repository.findById(data.id);

    if (!category) {
      throw new HttpException(
        'Categoria de produto não encontrada',
        HttpStatus.NOT_FOUND,
      );
    }

    return category;
  }
}
