import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { IChartOfAccountsRepository } from '../../domain/repository/chart-of-accounts.interface.repository';
import { UpdateChartOfAccountsDTO } from '../dto/update-chart-of-accounts.dto';
import { ChartOfAccounts } from '../../domain/entity/chart-of-accounts.entity';

export class UpdateChartOfAccountsUseCase
  implements BaseUseCase<{ id: string; data: UpdateChartOfAccountsDTO }, ChartOfAccounts>
{
  constructor(
    @Inject('IChartOfAccountsRepository')
    private readonly repository: IChartOfAccountsRepository,
  ) {}

  async execute(input: { id: string; data: UpdateChartOfAccountsDTO }): Promise<ChartOfAccounts> {
    const existing = await this.repository.findById(input.id);

    if (!existing) {
      throw new HttpException(
        'Conta não encontrada',
        HttpStatus.NOT_FOUND,
      );
    }

    if (input.data.contaPaiId) {
      const contaPai = await this.repository.findById(input.data.contaPaiId);

      if (!contaPai) {
        throw new HttpException(
          'Conta pai não encontrada',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    return this.repository.update(input.id, input.data);
  }
}
