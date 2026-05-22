import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { UpdateBankAgencyDTO } from '../dto/update-bank-agency.dto';
import { BankAgency } from '../../domain/entity/bank-agency.entity';
import { IBankAgencyRepository } from '../../domain/repository/bank-agency.interface.repository';

export class UpdateBankAgencyUseCase implements BaseUseCase<{ id: string; data: UpdateBankAgencyDTO }, BankAgency> {
  constructor(
    @Inject('IBankAgencyRepository')
    private readonly repository: IBankAgencyRepository,
  ) {}

  async execute(input: { id: string; data: UpdateBankAgencyDTO }): Promise<BankAgency> {
    const existing = await this.repository.findById(input.id);

    if (!existing) {
      throw new HttpException(
        'Agência não encontrada',
        HttpStatus.NOT_FOUND,
      );
    }

    return this.repository.update(input.id, input.data);
  }
}
