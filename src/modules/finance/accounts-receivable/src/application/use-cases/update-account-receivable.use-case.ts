import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { UpdateAccountReceivableDTO } from '../dto/update-account-receivable.dto';
import { AccountReceivable } from '../../domain/entity/account-receivable.entity';
import { IAccountReceivableRepository } from '../../domain/repository/account-receivable.interface.repository';

export class UpdateAccountReceivableUseCase implements BaseUseCase<{ id: string; data: UpdateAccountReceivableDTO }, AccountReceivable> {
  constructor(
    @Inject('IAccountReceivableRepository')
    private readonly repository: IAccountReceivableRepository,
  ) {}

  async execute(input: { id: string; data: UpdateAccountReceivableDTO }): Promise<AccountReceivable> {
    const existing = await this.repository.findById(input.id);

    if (!existing) {
      throw new HttpException(
        'Conta a receber não encontrada',
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
