import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { UpdateBankAccountDTO } from '../dto/update-bank-account.dto';
import { BankAccount } from '../../domain/entity/bank-account.entity';
import { IBankAccountRepository } from '../../domain/repository/bank-account.interface.repository';

export class UpdateBankAccountUseCase implements BaseUseCase<{ id: string; data: UpdateBankAccountDTO }, BankAccount> {
  constructor(
    @Inject('IBankAccountRepository')
    private readonly repository: IBankAccountRepository,
  ) {}

  async execute(input: { id: string; data: UpdateBankAccountDTO }): Promise<BankAccount> {
    const existing = await this.repository.findById(input.id);

    if (!existing) {
      throw new HttpException(
        'Conta bancária não encontrada',
        HttpStatus.NOT_FOUND,
      );
    }

    if (input.data.tipo && !['I', 'P', 'C'].includes(input.data.tipo)) {
      throw new HttpException(
        'O campo tipo deve ser I (Investimento), P (Poupança) ou C (Corrente)',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.repository.update(input.id, input.data);
  }
}
