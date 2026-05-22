import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { Bank } from '../../domain/entity/bank.entity';
import { IBankRepository } from '../../domain/repository/bank.interface.repository';

export class GetByIdBankUseCase implements BaseUseCase<{ id: string }, Bank> {
  constructor(
    @Inject('IBankRepository')
    private readonly repository: IBankRepository,
  ) {}

  async execute(data: { id: string }): Promise<Bank> {
    const bank = await this.repository.findById(data.id);

    if (!bank) {
      throw new HttpException(
        'Banco não encontrado',
        HttpStatus.NOT_FOUND,
      );
    }

    return bank;
  }
}
