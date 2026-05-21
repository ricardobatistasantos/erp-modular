import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { IFinancialCategoryRepository } from '../../domain/repository/financial-category.interface.repository';
import { IChartOfAccountsRepository } from '../../../../chart-of-accounts/src/domain/repository/chart-of-accounts.interface.repository';
import { CreateFinancialCategoryDTO } from '../dto/create-financial-category.dto';
import { FinancialCategory } from '../../domain/entity/financial-category.entity';

export class CreateFinancialCategoryUseCase
  implements BaseUseCase<CreateFinancialCategoryDTO, FinancialCategory>
{
  constructor(
    @Inject('IFinancialCategoryRepository')
    private readonly repository: IFinancialCategoryRepository,
    @Inject('IChartOfAccountsRepository')
    private readonly chartOfAccountsRepository: IChartOfAccountsRepository,
  ) {}

  async execute(data: CreateFinancialCategoryDTO): Promise<FinancialCategory> {
    if (data.planoContaId) {
      const planoContas = await this.chartOfAccountsRepository.findById(data.planoContaId);

      if (!planoContas) {
        throw new HttpException(
          'Plano de contas informado não existe',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
    }

    return this.repository.create(data);
  }
}
