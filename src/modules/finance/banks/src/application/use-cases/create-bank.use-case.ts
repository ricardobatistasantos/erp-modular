import { Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { CreateBankDTO } from '../dto/create-bank.dto';
import { Bank } from '../../domain/entity/bank.entity';
import { IBankRepository } from '../../domain/repository/bank.interface.repository';

export class CreateBankUseCase implements BaseUseCase<CreateBankDTO, Bank> {
  constructor(
    @Inject('IBankRepository')
    private readonly repository: IBankRepository,
  ) {}

  async execute(data: CreateBankDTO): Promise<Bank> {
    return this.repository.create(data);
  }
}
