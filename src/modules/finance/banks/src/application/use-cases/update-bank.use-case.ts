import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { UpdateBankDTO } from '../dto/update-bank.dto';
import { Bank } from '../../domain/entity/bank.entity';
import { IBankRepository } from '../../domain/repository/bank.interface.repository';

export class UpdateBankUseCase implements BaseUseCase<{ id: string; data: UpdateBankDTO }, Bank> {
  constructor(
    @Inject('IBankRepository')
    private readonly repository: IBankRepository,
  ) {}

  async execute(input: { id: string; data: UpdateBankDTO }): Promise<Bank> {
    const existing = await this.repository.findById(input.id);

    if (!existing) {
      throw new HttpException(
        'Banco não encontrado',
        HttpStatus.NOT_FOUND,
      );
    }

    return this.repository.update(input.id, input.data);
  }
}
