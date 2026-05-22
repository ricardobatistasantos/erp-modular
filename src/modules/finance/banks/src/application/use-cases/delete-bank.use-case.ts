import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { IBankRepository } from '../../domain/repository/bank.interface.repository';
import { IBankAgencyRepository } from '../../../../bank-agencies/src/domain/repository/bank-agency.interface.repository';

export class DeleteBankUseCase implements BaseUseCase<{ id: string }, void> {
  constructor(
    @Inject('IBankRepository')
    private readonly repository: IBankRepository,
    @Inject('IBankAgencyRepository')
    private readonly bankAgencyRepository: IBankAgencyRepository,
  ) {}

  async execute(data: { id: string }): Promise<void> {
    const existing = await this.repository.findById(data.id);

    if (!existing) {
      throw new HttpException(
        'Banco não encontrado',
        HttpStatus.NOT_FOUND,
      );
    }

    const agencyCount = await this.bankAgencyRepository.countByBancoId(data.id);

    if (agencyCount > 0) {
      throw new HttpException(
        'Não é possível excluir o banco: existem agências vinculadas',
        HttpStatus.CONFLICT,
      );
    }

    await this.repository.delete(data.id);
  }
}
