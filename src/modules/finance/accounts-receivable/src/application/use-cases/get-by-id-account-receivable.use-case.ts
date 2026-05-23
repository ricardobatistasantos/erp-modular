import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { AccountReceivable } from '../../domain/entity/account-receivable.entity';
import { IAccountReceivableRepository } from '../../domain/repository/account-receivable.interface.repository';
import { IInstallmentRepository } from '../../../../installments/src/domain/repository/installment.interface.repository';

export interface ParcelamentoResumo {
  valorTotal: number;
  quantidadeTotal: number;
  quantidadePagas: number;
  valorTotalPago: number;
  valorRestante: number;
}

export interface GetByIdAccountReceivableResult {
  conta: AccountReceivable;
  parcelamento: ParcelamentoResumo;
}

export class GetByIdAccountReceivableUseCase implements BaseUseCase<{ id: string }, GetByIdAccountReceivableResult> {
  constructor(
    @Inject('IAccountReceivableRepository')
    private readonly repository: IAccountReceivableRepository,
    @Inject('IInstallmentRepository')
    private readonly installmentRepository: IInstallmentRepository,
  ) {}

  async execute(data: { id: string }): Promise<GetByIdAccountReceivableResult> {
    const accountReceivable = await this.repository.findById(data.id);

    if (!accountReceivable) {
      throw new HttpException(
        'Conta a receber não encontrada',
        HttpStatus.NOT_FOUND,
      );
    }

    const parcelas = await this.installmentRepository.findByOrigemId(accountReceivable.id);

    if (parcelas.length === 0) {
      return {
        conta: accountReceivable,
        parcelamento: {
          valorTotal: 0,
          quantidadeTotal: 0,
          quantidadePagas: 0,
          valorTotalPago: 0,
          valorRestante: 0,
        },
      };
    }

    const parcelasNaoCanceladas = parcelas.filter(
      (p) => p.status !== 'CANCELADO',
    );

    const valorTotal =
      Math.round(
        parcelasNaoCanceladas.reduce((acc, p) => acc + Number(p.valor), 0) * 100,
      ) / 100;

    const quantidadeTotal = parcelasNaoCanceladas.length;

    const quantidadePagas = parcelasNaoCanceladas.filter(
      (p) => p.status === 'PAGO',
    ).length;

    const valorTotalPago =
      Math.round(
        parcelasNaoCanceladas.reduce((acc, p) => acc + Number(p.valorPago), 0) * 100,
      ) / 100;

    const valorRestante =
      Math.round((valorTotal - valorTotalPago) * 100) / 100;

    return {
      conta: accountReceivable,
      parcelamento: {
        valorTotal,
        quantidadeTotal,
        quantidadePagas,
        valorTotalPago,
        valorRestante,
      },
    };
  }
}
