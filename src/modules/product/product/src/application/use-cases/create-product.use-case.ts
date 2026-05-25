import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { IProductRepository } from '../../domain/repository/product.interface.repository';
import { CreateProductDTO } from '../dto/create-product.dto';
import { Product } from '../../domain/entity/product.entity';

export class CreateProductUseCase implements BaseUseCase<CreateProductDTO, Product> {
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

  async execute(data: CreateProductDTO): Promise<Product> {
    if (!data.nome || data.nome.trim() === '') {
      throw new HttpException(
        'O campo nome é obrigatório',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!data.produtoSubCategoriaId) {
      throw new HttpException(
        'O campo produtoSubCategoriaId é obrigatório',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!data.produtoUnidadeMedidaId) {
      throw new HttpException(
        'O campo produtoUnidadeMedidaId é obrigatório',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!data.produtoMarcaId) {
      throw new HttpException(
        'O campo produtoMarcaId é obrigatório',
        HttpStatus.BAD_REQUEST,
      );
    }

    const subCategory = await this.subCategoryRepository.findById(data.produtoSubCategoriaId);
    if (!subCategory) {
      throw new HttpException(
        'Subcategoria de produto não encontrada',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const unitOfMeasure = await this.unitOfMeasureRepository.findById(data.produtoUnidadeMedidaId);
    if (!unitOfMeasure) {
      throw new HttpException(
        'Unidade de medida não encontrada',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const brand = await this.brandRepository.findById(data.produtoMarcaId);
    if (!brand) {
      throw new HttpException(
        'Marca de produto não encontrada',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    return this.repository.create(data);
  }
}
