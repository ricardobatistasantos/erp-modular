import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { ISubCategoryRepository } from '../../domain/repository/sub-category.interface.repository';
import { UpdateSubCategoryDTO } from '../dto/update-sub-category.dto';
import { SubCategory } from '../../domain/entity/sub-category.entity';

export class UpdateSubCategoryUseCase implements BaseUseCase<{ id: string; data: UpdateSubCategoryDTO }, SubCategory> {
  constructor(
    @Inject('ISubCategoryRepository')
    private readonly repository: ISubCategoryRepository,
    @Inject('ICategoryRepository')
    private readonly categoryRepository: any,
  ) {}

  async execute(input: { id: string; data: UpdateSubCategoryDTO }): Promise<SubCategory> {
    const existingSubCategory = await this.repository.findById(input.id);

    if (!existingSubCategory) {
      throw new HttpException(
        'Subcategoria de produto não encontrada',
        HttpStatus.NOT_FOUND,
      );
    }

    if (input.data.produtoCategoriaId) {
      const category = await this.categoryRepository.findById(input.data.produtoCategoriaId);

      if (!category) {
        throw new HttpException(
          'Categoria de produto não encontrada',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
    }

    return this.repository.update(input.id, input.data);
  }
}
