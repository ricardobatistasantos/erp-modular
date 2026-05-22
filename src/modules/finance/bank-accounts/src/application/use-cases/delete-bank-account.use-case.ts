import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { IBankAccountRepository } from '../../domain/repository/bank-account.interface.repository';

export class DeleteBankAccountUseCase implements BaseUseCase<{ id: string }, void> {
  constructor(
    @Inject('IBankAccountRepository')
    private readonly repository: IBankAccountRepository,
  ) {}

  async execute(data: { id: string }): Promise<void> {
    const existing = await this.repository.findById(data.id);

    if (!existing) {
      throw new HttpException(
        'Conta bancária não encontrada',
        HttpStatus.NOT_FOUND,
      );
    }

    await this.repository.delete(data.id);
  }
}
