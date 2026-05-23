import { Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { Installment } from '../../domain/entity/installment.entity';
import { IInstallmentRepository } from '../../domain/repository/installment.interface.repository';

export interface InstallmentResumo {
  valorTotal: number;
  quantidadeTotal: number;
  quantidadePagas: number;
  valorTotalPago: number;
  valorRestante: number;
}

export interface FindInstallmentsByOrigemResult {
  parcelas: Installment[];
  resumo: InstallmentResumo;
}

export class FindInstallmentsByOrigemUseCase
  implements BaseUseCase<{ origemId: string }, FindInstallmentsByOrigemResult>
{
  constructor(
    @Inject('IInstallmentRepository')
    private readonly repository: IInstallmentRepository,
  ) {}

  async execute(data: { origemId: string }): Promise<FindInstallmentsByOrigemResult> {
    const parcelas = await this.repository.findByOrigemId(data.origemId);

    if (parcelas.length === 0) {
      return {
        parcelas: [],
        resumo: {
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
      parcelas,
      resumo: {
        valorTotal,
        quantidadeTotal,
        quantidadePagas,
        valorTotalPago,
        valorRestante,
      },
    };
  }
}
