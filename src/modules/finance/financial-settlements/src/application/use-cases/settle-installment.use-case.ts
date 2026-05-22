import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { SettleInstallmentDTO } from '../dto/settle-installment.dto';
import { FinancialSettlement } from '../../domain/entity/financial-settlement.entity';
import { IFinancialSettlementRepository } from '../../domain/repository/financial-settlement.interface.repository';
import { IInstallmentRepository } from '../../../../installments/src/domain/repository/installment.interface.repository';
import { IAccountPayableRepository } from '../../../../accounts-payable/src/domain/repository/account-payable.interface.repository';
import { IAccountReceivableRepository } from '../../../../accounts-receivable/src/domain/repository/account-receivable.interface.repository';
import { IFinancialEntryRepository } from '../../../../financial-entries/src/domain/repository/financial-entry.interface.repository';
import { Installment } from '../../../../installments/src/domain/entity/installment.entity';

export class SettleInstallmentUseCase implements BaseUseCase<SettleInstallmentDTO, FinancialSettlement> {
  constructor(
    @Inject('IFinancialSettlementRepository')
    private readonly settlementRepository: IFinancialSettlementRepository,
    @Inject('IInstallmentRepository')
    private readonly installmentRepository: IInstallmentRepository,
    @Inject('IAccountPayableRepository')
    private readonly accountPayableRepository: IAccountPayableRepository,
    @Inject('IAccountReceivableRepository')
    private readonly accountReceivableRepository: IAccountReceivableRepository,
    @Inject('IFinancialEntryRepository')
    private readonly financialEntryRepository: IFinancialEntryRepository,
    @Inject('DATABASE_CONNECTION')
    private readonly connection: any,
  ) {}

  async execute(data: SettleInstallmentDTO): Promise<FinancialSettlement> {
    const juros = data.juros ?? 0;
    const multa = data.multa ?? 0;
    const desconto = data.desconto ?? 0;

    // Validate non-negative values for juros, multa, desconto
    if (juros < 0 || multa < 0 || desconto < 0) {
      throw new HttpException(
        'Valores de juros, multa e desconto devem ser >= 0',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.connection().tx(async (transaction) => {
      // 1. Find installment by parcelaId
      const installment = await this.installmentRepository.findById(data.parcelaId);
      if (!installment) {
        throw new HttpException(
          'Parcela não encontrada',
          HttpStatus.NOT_FOUND,
        );
      }

      // 2. Validate saldo & calculate valorLiquido
      const saldoRestante = installment.valor - installment.valorPago;
      if (saldoRestante <= 0) {
        throw new HttpException(
          'Parcela já está totalmente quitada',
          HttpStatus.BAD_REQUEST,
        );
      }

      const valorLiquido = Math.round((data.valor + juros + multa - desconto) * 100) / 100;

      const saldoRestanteRounded = Math.round(saldoRestante * 100) / 100;
      if (valorLiquido > saldoRestanteRounded) {
        throw new HttpException(
          `Valor líquido (R$ ${valorLiquido.toFixed(2)}) excede o saldo restante da parcela (R$ ${saldoRestante.toFixed(2)})`,
          HttpStatus.BAD_REQUEST,
        );
      }

      // 3. Find parent account for financial entry metadata
      let account;
      if (data.tipoConta === 'PAGAR') {
        account = await this.accountPayableRepository.findById(installment.origemId);
      } else {
        account = await this.accountReceivableRepository.findById(installment.origemId);
      }

      // 4. Create financial entry with valorLiquido
      const entryData = {
        tipo: data.tipoConta === 'PAGAR' ? 'DESPESA' : 'RECEITA',
        origem: 'BAIXA',
        origemId: installment.origemId,
        planoContaId: account?.categoriaFinanceiraId || null,
        dataLancamento: data.dataPagamento,
        descricao: `Baixa financeira - Parcela ${installment.numeroParcela}/${installment.totalParcelas}`,
        valor: valorLiquido,
        contaBancariaId: data.contaBancariaId || null,
        caixaId: data.caixaId || null,
      };
      const financialEntry = await this.financialEntryRepository.create(entryData, transaction);

      // 5. Create settlement record
      const settlementData = {
        tipoConta: data.tipoConta,
        parcelaId: data.parcelaId,
        valor: data.valor,
        juros,
        multa,
        desconto,
        valorLiquido,
        dataPagamento: data.dataPagamento,
        formaPagamento: data.formaPagamento,
        contaBancariaId: data.contaBancariaId || null,
        caixaId: data.caixaId || null,
        lancamentoFinanceiroId: financialEntry.id,
        observacao: data.observacao || null,
      };
      const settlement = await this.settlementRepository.create(settlementData, transaction);

      // 6. Update installment valorPago and derive status
      const novoValorPago = Math.round((installment.valorPago + valorLiquido) * 100) / 100;
      const novoStatus = novoValorPago >= installment.valor ? 'PAGO' : 'PARCIAL';
      await this.installmentRepository.updateValorPago(
        data.parcelaId,
        novoValorPago,
        novoStatus,
        transaction,
      );

      // 7. Find all installments for the parent account and derive parent status
      const allInstallments = await this.installmentRepository.findByOrigemId(installment.origemId);

      // Update the current installment in the list for accurate status derivation
      const updatedInstallments = allInstallments.map((i) =>
        i.id === data.parcelaId
          ? { ...i, valorPago: novoValorPago, status: novoStatus }
          : i,
      );

      const parentStatus = this.deriveParentStatus(updatedInstallments as Installment[], data.tipoConta);

      // 8. Calculate total valorPago across all installments
      const totalValorPago = updatedInstallments.reduce(
        (sum, i) => sum + i.valorPago,
        0,
      );

      // 9. Update parent account valorPago and status
      if (data.tipoConta === 'PAGAR') {
        await this.accountPayableRepository.updateValorPago(
          installment.origemId,
          totalValorPago,
          parentStatus,
          transaction,
        );
      } else {
        await this.accountReceivableRepository.updateValorRecebido(
          installment.origemId,
          totalValorPago,
          parentStatus,
          transaction,
        );
      }

      return settlement;
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
