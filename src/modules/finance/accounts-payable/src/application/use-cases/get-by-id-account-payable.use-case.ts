import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { AccountPayable } from '../../domain/entity/account-payable.entity';
import { IAccountPayableRepository } from '../../domain/repository/account-payable.interface.repository';

export class GetByIdAccountPayableUseCase implements BaseUseCase<{ id: string }, AccountPayable> {
  constructor(
    @Inject('IAccountPayableRepository')
    private readonly repository: IAccountPayableRepository,
  ) {}

  async execute(data: { id: string }): Promise<AccountPayable> {
    const accountPayable = await this.repository.findById(data.id);

    if (!accountPayable) {
      throw new HttpException(
        'Conta a pagar não encontrada',
        HttpStatus.NOT_FOUND,
      );
    }

    return accountPayable;
  }
}
