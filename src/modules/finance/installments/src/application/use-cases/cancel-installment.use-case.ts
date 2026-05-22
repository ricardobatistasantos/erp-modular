import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { CancelInstallmentDTO } from '../dto/cancel-installment.dto';
import { Installment } from '../../domain/entity/installment.entity';
import { IInstallmentRepository } from '../../domain/repository/installment.interface.repository';
import { IFinancialSettlementRepository } from '../../../../financial-settlements/src/domain/repository/financial-settlement.interface.repository';
import { IAccountPayableRepository } from '../../../../accounts-payable/src/domain/repository/account-payable.interface.repository';
import { IAccountReceivableRepository } from '../../../../accounts-receivable/src/domain/repository/account-receivable.interface.repository';

export class CancelInstallmentUseCase implements BaseUseCase<CancelInstallmentDTO, Installment> {
  constructor(
    @Inject('IInstallmentRepository')
    private readonly installmentRepository: IInstallmentRepository,
    @Inject('IFinancialSettlementRepository')
    private readonly financialSettlementRepository: IFinancialSettlementRepository,
    @Inject('IAccountPayableRepository')
    private readonly accountPayableRepository: IAccountPayableRepository,
    @Inject('IAccountReceivableRepository')
    private readonly accountReceivableRepository: IAccountReceivableRepository,
    @Inject('DATABASE_CONNECTION')
    private readonly connection: any,
  ) {}

  async execute(data: CancelInstallmentDTO): Promise<Installment> {
    const installment = await this.installmentRepository.findById(data.parcelaId);
    if (!installment) {
      throw new HttpException(
        'Parcela não encontrada',
        HttpStatus.NOT_FOUND,
      );
    }

    const hasSettlements = await this.financialSettlementRepository.existsByParcelaId(data.parcelaId);
    if (hasSettlements) {
      throw new HttpException(
        'Não é possível cancelar parcela: existem baixas financeiras vinculadas',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.connection().tx(async (transaction) => {
      const cancelledInstallment = await this.installmentRepository.updateStatus(
        data.parcelaId,
        'CANCELADO',
        transaction,
      );

      const allInstallments = await this.installmentRepository.findByOrigemId(installment.origemId);
      const parentStatus = this.deriveParentStatus(allInstallments, installment.origem);

      const sumValorPago = allInstallments
        .filter((i) => i.status !== 'CANCELADO')
        .reduce((sum, i) => sum + i.valorPago, 0);

      if (installment.origem === 'PAGAR') {
        await this.accountPayableRepository.updateValorPago(
          installment.origemId,
          sumValorPago,
          parentStatus,
          transaction,
        );
      } else {
        await this.accountReceivableRepository.updateValorRecebido(
          installment.origemId,
          sumValorPago,
          parentStatus,
          transaction,
        );
      }

      return cancelledInstallment;
    });
  }

  private deriveParentStatus(installments: Installment[], tipoConta: string): string {
    const activeInstallments = installments.filter((i) => i.status !== 'CANCELADO');

    if (activeInstallments.length === 0) return 'CANCELADO';

    const allPaid = activeInstallments.every((i) => i.status === 'PAGO');
    if (allPaid) return tipoConta === 'PAGAR' ? 'PAGO' : 'RECEBIDO';

    const anyPaid = activeInstallments.some(
      (i) => i.status === 'PAGO' || i.status === 'PARCIAL',
    );
    if (anyPaid) return 'PARCIAL';

    return 'PENDENTE';
  }
}
