import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { CreateBankAccountDTO } from '../dto/create-bank-account.dto';
import { BankAccount } from '../../domain/entity/bank-account.entity';
import { IBankAccountRepository } from '../../domain/repository/bank-account.interface.repository';
import { IBankAgencyRepository } from '../../../../bank-agencies/src/domain/repository/bank-agency.interface.repository';

export class CreateBankAccountUseCase implements BaseUseCase<CreateBankAccountDTO, BankAccount> {
  constructor(
    @Inject('IBankAccountRepository')
    private readonly repository: IBankAccountRepository,
    @Inject('IBankAgencyRepository')
    private readonly bankAgencyRepository: IBankAgencyRepository,
  ) {}

  async execute(data: CreateBankAccountDTO): Promise<BankAccount> {
    const missingFields: string[] = [];

    if (!data.bancoAgenciaId || data.bancoAgenciaId.trim() === '') {
      missingFields.push('bancoAgenciaId');
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

    if (!data.tipo || data.tipo.trim() === '') {
      missingFields.push('tipo');
    }

    if (missingFields.length > 0) {
      throw new HttpException(
        `Campos obrigatórios não informados: ${missingFields.join(', ')}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!['I', 'P', 'C'].includes(data.tipo)) {
      throw new HttpException(
        'O campo tipo deve ser I (Investimento), P (Poupança) ou C (Corrente)',
        HttpStatus.BAD_REQUEST,
      );
    }

    const agency = await this.bankAgencyRepository.findById(data.bancoAgenciaId);

    if (!agency) {
      throw new HttpException(
        'A agência referenciada não existe',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.repository.create(data);
  }
}
