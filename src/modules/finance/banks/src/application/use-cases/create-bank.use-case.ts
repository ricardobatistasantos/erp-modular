import { HttpException, HttpStatus, Inject } from '@nestjs/common';

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
    const missingFields: string[] = [];

    if (!data.codigo || data.codigo.trim() === '') {
      missingFields.push('codigo');
    }

    if (!data.nome || data.nome.trim() === '') {
      missingFields.push('nome');
    }

    if (missingFields.length > 0) {
      throw new HttpException(
        `Campos obrigatórios não informados: ${missingFields.join(', ')}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.repository.create(data);
  }
}
