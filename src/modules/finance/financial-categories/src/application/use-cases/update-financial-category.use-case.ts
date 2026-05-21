import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { IFinancialCategoryRepository } from '../../domain/repository/financial-category.interface.repository';
import { IChartOfAccountsRepository } from '../../../../chart-of-accounts/src/domain/repository/chart-of-accounts.interface.repository';
import { UpdateFinancialCategoryDTO } from '../dto/update-financial-category.dto';
import { FinancialCategory } from '../../domain/entity/financial-category.entity';

export class UpdateFinancialCategoryUseCase
  implements BaseUseCase<{ id: string; data: UpdateFinancialCategoryDTO }, FinancialCategory>
{
  constructor(
    @Inject('IFinancialCategoryRepository')
    private readonly repository: IFinancialCategoryRepository,
    @Inject('IChartOfAccountsRepository')
    private readonly chartOfAccountsRepository: IChartOfAccountsRepository,
  ) {}

  async execute(input: { id: string; data: UpdateFinancialCategoryDTO }): Promise<FinancialCategory> {
    const existing = await this.repository.findById(input.id);

    if (!existing) {
      throw new HttpException(
        'Categoria financeira não encontrada',
        HttpStatus.NOT_FOUND,
      );
    }

    if (input.data.planoContaId) {
      const planoContas = await this.chartOfAccountsRepository.findById(input.data.planoContaId);

      if (!planoContas) {
        throw new HttpException(
          'Plano de contas informado não existe',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
    }

    return this.repository.update(input.id, input.data);
  }
}
