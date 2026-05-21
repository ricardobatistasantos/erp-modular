import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { IFinancialCategoryRepository } from '../../domain/repository/financial-category.interface.repository';
import { FinancialCategory } from '../../domain/entity/financial-category.entity';

export class GetByIdFinancialCategoryUseCase
  implements BaseUseCase<{ id: string }, FinancialCategory>
{
  constructor(
    @Inject('IFinancialCategoryRepository')
    private readonly repository: IFinancialCategoryRepository,
  ) {}

  async execute(data: { id: string }): Promise<FinancialCategory> {
    const category = await this.repository.findById(data.id);

    if (!category) {
      throw new HttpException(
        'Categoria financeira não encontrada',
        HttpStatus.NOT_FOUND,
      );
    }

    return category;
  }
}
