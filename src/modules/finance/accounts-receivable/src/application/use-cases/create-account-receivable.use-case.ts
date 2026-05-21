import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { CreateAccountReceivableDTO } from '../dto/create-account-receivable.dto';
import { AccountReceivable } from '../../domain/entity/account-receivable.entity';
import { IAccountReceivableRepository } from '../../domain/repository/account-receivable.interface.repository';

export class CreateAccountReceivableUseCase implements BaseUseCase<CreateAccountReceivableDTO, AccountReceivable> {
  constructor(
    @Inject('IAccountReceivableRepository')
    private readonly repository: IAccountReceivableRepository,
  ) {}

  async execute(data: CreateAccountReceivableDTO): Promise<AccountReceivable> {
    if (!data.pessoaId || !data.numeroDocumento || !data.descricao || !data.categoriaFinanceiraId || !data.dataEmissao || !data.dataVencimento || !data.valor) {
      throw new HttpException(
        'Campos obrigatórios não informados: pessoaId, numeroDocumento, descricao, categoriaFinanceiraId, dataEmissao, dataVencimento e valor são obrigatórios',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (data.valor <= 0) {
      throw new HttpException(
        'O campo valor deve ser maior que zero',
        HttpStatus.BAD_REQUEST,
      );
    }

    const dataEmissao = new Date(data.dataEmissao);
    const dataVencimento = new Date(data.dataVencimento);

    if (dataVencimento < dataEmissao) {
      throw new HttpException(
        'A data de vencimento deve ser igual ou posterior à data de emissão',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.repository.create(data);
  }
}
