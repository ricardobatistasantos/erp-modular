import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { BankAccount } from '../../domain/entity/bank-account.entity';
import { IBankAccountRepository } from '../../domain/repository/bank-account.interface.repository';

export class GetByIdBankAccountUseCase implements BaseUseCase<{ id: string }, BankAccount> {
  constructor(
    @Inject('IBankAccountRepository')
    private readonly repository: IBankAccountRepository,
  ) {}

  async execute(data: { id: string }): Promise<BankAccount> {
    const account = await this.repository.findById(data.id);

    if (!account) {
      throw new HttpException(
        'Conta bancária não encontrada',
        HttpStatus.NOT_FOUND,
      );
    }

    return account;
  }
}
