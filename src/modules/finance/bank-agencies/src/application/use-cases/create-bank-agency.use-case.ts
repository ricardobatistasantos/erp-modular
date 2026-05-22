import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { CreateBankAgencyDTO } from '../dto/create-bank-agency.dto';
import { BankAgency } from '../../domain/entity/bank-agency.entity';
import { IBankAgencyRepository } from '../../domain/repository/bank-agency.interface.repository';
import { IBankRepository } from '../../../../banks/src/domain/repository/bank.interface.repository';

export class CreateBankAgencyUseCase implements BaseUseCase<CreateBankAgencyDTO, BankAgency> {
  constructor(
    @Inject('IBankAgencyRepository')
    private readonly repository: IBankAgencyRepository,
    @Inject('IBankRepository')
    private readonly bankRepository: IBankRepository,
  ) {}

  async execute(data: CreateBankAgencyDTO): Promise<BankAgency> {
    const missingFields: string[] = [];

    if (!data.bancoId || data.bancoId.trim() === '') {
      missingFields.push('bancoId');
    }

    if (!data.numero || data.numero.trim() === '') {
      missingFields.push('numero');
    }

    if (!data.digito || data.digito.trim() === '') {
      missingFields.push('digito');
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

    const bank = await this.bankRepository.findById(data.bancoId);

    if (!bank) {
      throw new HttpException(
        'O banco referenciado não existe',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.repository.create(data);
  }
}
