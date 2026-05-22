import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { BankAgency } from '../../domain/entity/bank-agency.entity';
import { IBankAgencyRepository } from '../../domain/repository/bank-agency.interface.repository';

export class GetByIdBankAgencyUseCase implements BaseUseCase<{ id: string }, BankAgency> {
  constructor(
    @Inject('IBankAgencyRepository')
    private readonly repository: IBankAgencyRepository,
  ) {}

  async execute(data: { id: string }): Promise<BankAgency> {
    const agency = await this.repository.findById(data.id);

    if (!agency) {
      throw new HttpException(
        'Agência não encontrada',
        HttpStatus.NOT_FOUND,
      );
    }

    return agency;
  }
}
