import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { UpdateAccountPayableDTO } from '../dto/update-account-payable.dto';
import { AccountPayable } from '../../domain/entity/account-payable.entity';
import { IAccountPayableRepository } from '../../domain/repository/account-payable.interface.repository';

export class UpdateAccountPayableUseCase implements BaseUseCase<{ id: string; data: UpdateAccountPayableDTO }, AccountPayable> {
  constructor(
    @Inject('IAccountPayableRepository')
    private readonly repository: IAccountPayableRepository,
  ) {}

  async execute(input: { id: string; data: UpdateAccountPayableDTO }): Promise<AccountPayable> {
    const existing = await this.repository.findById(input.id);

    if (!existing) {
      throw new HttpException(
        'Conta a pagar não encontrada',
        HttpStatus.NOT_FOUND,
      );
    }

    if (input.data.dataEmissao && input.data.dataVencimento) {
      const dataEmissao = new Date(input.data.dataEmissao);
      const dataVencimento = new Date(input.data.dataVencimento);

      if (dataVencimento < dataEmissao) {
        throw new HttpException(
          'A data de vencimento deve ser igual ou posterior à data de emissão',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    return this.repository.update(input.id, input.data);
  }
}
