import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { IBankAgencyRepository } from '../../domain/repository/bank-agency.interface.repository';
import { IBankAccountRepository } from '../../../../bank-accounts/src/domain/repository/bank-account.interface.repository';

export class DeleteBankAgencyUseCase implements BaseUseCase<{ id: string }, void> {
  constructor(
    @Inject('IBankAgencyRepository')
    private readonly repository: IBankAgencyRepository,
    @Inject('IBankAccountRepository')
    private readonly bankAccountRepository: IBankAccountRepository,
  ) {}

  async execute(data: { id: string }): Promise<void> {
    const existing = await this.repository.findById(data.id);

    if (!existing) {
      throw new HttpException(
        'Agência não encontrada',
        HttpStatus.NOT_FOUND,
      );
    }

    const accountCount = await this.bankAccountRepository.countByAgenciaId(data.id);

    if (accountCount > 0) {
      throw new HttpException(
        'Não é possível excluir a agência: existem contas vinculadas',
        HttpStatus.CONFLICT,
      );
    }

    await this.repository.delete(data.id);
  }
}
