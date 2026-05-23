import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { AccountPayable } from '../../domain/entity/account-payable.entity';
import { IAccountPayableRepository } from '../../domain/repository/account-payable.interface.repository';
import { IInstallmentRepository } from '../../../../installments/src/domain/repository/installment.interface.repository';

export interface ParcelamentoResumo {
  valorTotal: number;
  quantidadeTotal: number;
  quantidadePagas: number;
  valorTotalPago: number;
  valorRestante: number;
}

export interface GetByIdAccountPayableResult {
  conta: AccountPayable;
  parcelamento: ParcelamentoResumo;
}

export class GetByIdAccountPayableUseCase implements BaseUseCase<{ id: string }, GetByIdAccountPayableResult> {
  constructor(
    @Inject('IAccountPayableRepository')
    private readonly repository: IAccountPayableRepository,
    @Inject('IInstallmentRepository')
    private readonly installmentRepository: IInstallmentRepository,
  ) {}

  async execute(data: { id: string }): Promise<GetByIdAccountPayableResult> {
    const accountPayable = await this.repository.findById(data.id);

    if (!accountPayable) {
      throw new HttpException(
        'Conta a pagar não encontrada',
        HttpStatus.NOT_FOUND,
      );
    }

    const parcelas = await this.installmentRepository.findByOrigemId(accountPayable.id);

    if (parcelas.length === 0) {
      return {
        conta: accountPayable,
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
      conta: accountPayable,
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
