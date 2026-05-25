import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { ISubCategoryRepository } from '../../domain/repository/sub-category.interface.repository';
import { SubCategory } from '../../domain/entity/sub-category.entity';

export class GetByIdSubCategoryUseCase implements BaseUseCase<{ id: string }, SubCategory> {
  constructor(
    @Inject('ISubCategoryRepository')
    private readonly repository: ISubCategoryRepository,
  ) {}

  async execute(data: { id: string }): Promise<SubCategory> {
    const subCategory = await this.repository.findById(data.id);

    if (!subCategory) {
      throw new HttpException(
        'Subcategoria de produto não encontrada',
        HttpStatus.NOT_FOUND,
      );
    }

    return subCategory;
  }
}
