import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { IProductRepository } from '../../domain/repository/product.interface.repository';
import { UpdateProductDTO } from '../dto/update-product.dto';
import { Product } from '../../domain/entity/product.entity';

export class UpdateProductUseCase implements BaseUseCase<{ id: string; data: UpdateProductDTO }, Product> {
  constructor(
    @Inject('IProductRepository')
    private readonly repository: IProductRepository,
    @Inject('ISubCategoryRepository')
    private readonly subCategoryRepository: any,
    @Inject('IUnitOfMeasureRepository')
    private readonly unitOfMeasureRepository: any,
    @Inject('IBrandRepository')
    private readonly brandRepository: any,
  ) {}

  async execute(input: { id: string; data: UpdateProductDTO }): Promise<Product> {
    const existingProduct = await this.repository.findById(input.id);

    if (!existingProduct) {
      throw new HttpException(
        'Produto não encontrado',
        HttpStatus.NOT_FOUND,
      );
    }

    if (input.data.produtoSubCategoriaId) {
      const subCategory = await this.subCategoryRepository.findById(input.data.produtoSubCategoriaId);
      if (!subCategory) {
        throw new HttpException(
          'Subcategoria de produto não encontrada',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
    }

    if (input.data.produtoUnidadeMedidaId) {
      const unitOfMeasure = await this.unitOfMeasureRepository.findById(input.data.produtoUnidadeMedidaId);
      if (!unitOfMeasure) {
        throw new HttpException(
          'Unidade de medida não encontrada',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
    }

    if (input.data.produtoMarcaId) {
      const brand = await this.brandRepository.findById(input.data.produtoMarcaId);
      if (!brand) {
        throw new HttpException(
          'Marca de produto não encontrada',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
    }

    return this.repository.update(input.id, input.data);
  }
}
