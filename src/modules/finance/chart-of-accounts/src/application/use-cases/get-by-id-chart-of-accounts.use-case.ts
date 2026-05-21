import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { IChartOfAccountsRepository } from '../../domain/repository/chart-of-accounts.interface.repository';
import { ChartOfAccounts } from '../../domain/entity/chart-of-accounts.entity';

export class GetByIdChartOfAccountsUseCase
  implements BaseUseCase<{ id: string }, ChartOfAccounts>
{
  constructor(
    @Inject('IChartOfAccountsRepository')
    private readonly repository: IChartOfAccountsRepository,
  ) {}

  async execute(data: { id: string }): Promise<ChartOfAccounts> {
    const account = await this.repository.findById(data.id);

    if (!account) {
      throw new HttpException(
        'Conta não encontrada',
        HttpStatus.NOT_FOUND,
      );
    }

    return account;
  }
}
