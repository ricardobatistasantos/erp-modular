import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { IProductRepository } from '../../domain/repository/product.interface.repository';
import { Product } from '../../domain/entity/product.entity';

export class GetByIdProductUseCase implements BaseUseCase<{ id: string }, Product> {
  constructor(
    @Inject('IProductRepository')
    private readonly repository: IProductRepository,
  ) {}

  async execute(data: { id: string }): Promise<Product> {
    const product = await this.repository.findById(data.id);

    if (!product) {
      throw new HttpException(
        'Produto não encontrado',
        HttpStatus.NOT_FOUND,
      );
    }

    return product;
  }
}
