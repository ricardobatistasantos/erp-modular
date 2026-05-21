import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { IChartOfAccountsRepository } from '../../domain/repository/chart-of-accounts.interface.repository';
import { CreateChartOfAccountsDTO } from '../dto/create-chart-of-accounts.dto';
import { ChartOfAccounts } from '../../domain/entity/chart-of-accounts.entity';

export class CreateChartOfAccountsUseCase
  implements BaseUseCase<CreateChartOfAccountsDTO, ChartOfAccounts>
{
  constructor(
    @Inject('IChartOfAccountsRepository')
    private readonly repository: IChartOfAccountsRepository,
  ) {}

  async execute(data: CreateChartOfAccountsDTO): Promise<ChartOfAccounts> {
    const existingCodigo = await this.repository.findByCodigo(data.codigo);

    if (existingCodigo) {
      throw new HttpException(
        'Código já está em uso',
        HttpStatus.CONFLICT,
      );
    }

    if (data.contaPaiId) {
      const contaPai = await this.repository.findById(data.contaPaiId);

      if (!contaPai) {
        throw new HttpException(
          'Conta pai não encontrada',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    return this.repository.create(data);
  }
}
