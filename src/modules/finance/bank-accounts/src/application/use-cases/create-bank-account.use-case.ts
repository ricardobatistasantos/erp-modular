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
