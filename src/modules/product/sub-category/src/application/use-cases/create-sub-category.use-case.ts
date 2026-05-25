import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { ISubCategoryRepository } from '../../domain/repository/sub-category.interface.repository';
import { CreateSubCategoryDTO } from '../dto/create-sub-category.dto';
import { SubCategory } from '../../domain/entity/sub-category.entity';

export class CreateSubCategoryUseCase implements BaseUseCase<CreateSubCategoryDTO, SubCategory> {
  constructor(
    @Inject('ISubCategoryRepository')
    private readonly repository: ISubCategoryRepository,
    @Inject('ICategoryRepository')
    private readonly categoryRepository: any,
  ) {}

  async execute(data: CreateSubCategoryDTO): Promise<SubCategory> {
    if (!data.nome || data.nome.trim() === '') {
      throw new HttpException(
        'O campo nome é obrigatório',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!data.produtoCategoriaId) {
      throw new HttpException(
        'O campo produtoCategoriaId é obrigatório',
        HttpStatus.BAD_REQUEST,
      );
    }

    const category = await this.categoryRepository.findById(data.produtoCategoriaId);

    if (!category) {
      throw new HttpException(
        'Categoria de produto não encontrada',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    return this.repository.create(data);
  }
}
