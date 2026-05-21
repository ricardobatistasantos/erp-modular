import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { CreateAccountPayableDTO } from '../dto/create-account-payable.dto';
import { AccountPayable } from '../../domain/entity/account-payable.entity';
import { IAccountPayableRepository } from '../../domain/repository/account-payable.interface.repository';

export class CreateAccountPayableUseCase implements BaseUseCase<CreateAccountPayableDTO, AccountPayable> {
  constructor(
    @Inject('IAccountPayableRepository')
    private readonly repository: IAccountPayableRepository,
  ) {}

  async execute(data: CreateAccountPayableDTO): Promise<AccountPayable> {
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
