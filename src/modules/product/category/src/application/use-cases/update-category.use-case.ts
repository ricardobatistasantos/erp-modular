import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { ICategoryRepository } from '../../domain/repository/category.interface.repository';
import { UpdateCategoryDTO } from '../dto/update-category.dto';
import { Category } from '../../domain/entity/category.entity';

export class UpdateCategoryUseCase implements BaseUseCase<{ id: string; data: UpdateCategoryDTO }, Category> {
  constructor(
    @Inject('ICategoryRepository')
    private readonly repository: ICategoryRepository,
  ) {}

  async execute(input: { id: string; data: UpdateCategoryDTO }): Promise<Category> {
    const existingCategory = await this.repository.findById(input.id);

    if (!existingCategory) {
      throw new HttpException(
        'Categoria de produto não encontrada',
        HttpStatus.NOT_FOUND,
      );
    }

    return this.repository.update(input.id, input.data);
  }
}
