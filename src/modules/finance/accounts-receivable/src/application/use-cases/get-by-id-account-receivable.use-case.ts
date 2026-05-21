import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { AccountReceivable } from '../../domain/entity/account-receivable.entity';
import { IAccountReceivableRepository } from '../../domain/repository/account-receivable.interface.repository';

export class GetByIdAccountReceivableUseCase implements BaseUseCase<{ id: string }, AccountReceivable> {
  constructor(
    @Inject('IAccountReceivableRepository')
    private readonly repository: IAccountReceivableRepository,
  ) {}

  async execute(data: { id: string }): Promise<AccountReceivable> {
    const accountReceivable = await this.repository.findById(data.id);

    if (!accountReceivable) {
      throw new HttpException(
        'Conta a receber não encontrada',
        HttpStatus.NOT_FOUND,
      );
    }

    return accountReceivable;
  }
}
