import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { RegenerateInstallmentsDTO } from '../dto/regenerate-installments.dto';
import { Installment } from '../../domain/entity/installment.entity';
import { IInstallmentRepository } from '../../domain/repository/installment.interface.repository';
import { IAccountPayableRepository } from '../../../../accounts-payable/src/domain/repository/account-payable.interface.repository';
import { IAccountReceivableRepository } from '../../../../accounts-receivable/src/domain/repository/account-receivable.interface.repository';
import { InstallmentCalculator } from '../../domain/services/installment-calculator';
import { InstallmentValidation } from '../../domain/validation/installment-validation';

export class RegenerateInstallmentsUseCase
  implements BaseUseCase<RegenerateInstallmentsDTO, Installment[]>
{
  constructor(
    @Inject('IInstallmentRepository')
    private readonly installmentRepository: IInstallmentRepository,
    @Inject('IAccountPayableRepository')
    private readonly accountPayableRepository: IAccountPayableRepository,
    @Inject('IAccountReceivableRepository')
    private readonly accountReceivableRepository: IAccountReceivableRepository,
    @Inject('DATABASE_CONNECTION')
    private readonly connection: any,
    private readonly installmentCalculator: InstallmentCalculator,
    private readonly installmentValidation: InstallmentValidation,
  ) {}

  async execute(data: RegenerateInstallmentsDTO): Promise<Installment[]> {
    // 1. Fetch account by ID based on tipoConta
    const account = await this.findAccount(data.contaId, data.tipoConta);

    // 2. Fetch PENDENTE installments by origemId
    const parcelasPendentes =
      await this.installmentRepository.findPendingByOrigemId(data.contaId);

    // 3. Validate: at least one PENDENTE exists
    if (parcelasPendentes.length === 0) {
      throw new HttpException(
        'Não há parcelas pendentes para regenerar',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 4. Check for settlements on PENDENTE installments
    const parcelaIds = parcelasPendentes.map((p) => p.id);
    const hasSettlements =
      await this.installmentRepository.hasSettlementsByParcelaIds(parcelaIds);

    if (hasSettlements) {
      throw new HttpException(
        'Não é possível regenerar: existem baixas financeiras vinculadas a parcelas pendentes',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 5. Fetch ALL installments by origemId to calculate valorPago from PAGO/PARCIAL
    const todasParcelas = await this.installmentRepository.findByOrigemId(
      data.contaId,
    );

    // 6. Calculate valorRestante = account.valor - sum of valorPago from PAGO/PARCIAL installments
    const parcelasPagasOuParciais = todasParcelas.filter(
      (p) => p.status === 'PAGO' || p.status === 'PARCIAL',
    );
    const somaValorPago =
      Math.round(
        parcelasPagasOuParciais.reduce(
          (acc, p) => acc + Number(p.valorPago),
          0,
        ) * 100,
      ) / 100;

    const valorRestante =
      Math.round((Number(account.valor) - somaValorPago) * 100) / 100;

    // 7. Execute in transaction
    return this.connection().tx(async (transaction: any) => {
      // 7a. Cancel all PENDENTE installments
      await this.installmentRepository.cancelMany(parcelaIds, transaction);

      // 7b. Get next available number
      const maxNumeroParcela =
        await this.installmentRepository.getMaxNumeroParcela(data.contaId);

      // 7c. Calculate new installments using InstallmentCalculator.calculate()
      const parcelasCalculadas = this.installmentCalculator.calculate({
        valorTotal: valorRestante,
        quantidadeParcelas: data.quantidadeParcelas,
        dataVencimentoBase: account.dataVencimento,
        intervaloMeses: data.intervaloMeses,
        valores: data.valores,
        datasVencimento: data.datasVencimento,
      });

      // 7d. Adjust numeroParcela to start from (maxNumeroParcela + 1)
      const parcelasParaCriar = parcelasCalculadas.map((p, index) => ({
        origem: data.tipoConta,
        origemId: data.contaId,
        numeroParcela: maxNumeroParcela + 1 + index,
        totalParcelas: data.quantidadeParcelas,
        dataVencimento: p.dataVencimento,
        valor: p.valor,
        valorPago: 0,
        status: 'PENDENTE',
      }));

      // 7e. Create new installments
      const novasParcelas = await this.installmentRepository.createMany(
        parcelasParaCriar,
        transaction,
      );

      // 7f. Derive account status from all active installments
      const todasParcelasAtivas = [
        ...parcelasPagasOuParciais,
        ...novasParcelas,
      ];
      const novoStatus = this.deriveAccountStatus(
        todasParcelasAtivas,
        data.tipoConta,
      );

      // 7g. Update account status
      if (data.tipoConta === 'PAGAR') {
        await this.accountPayableRepository.update(
          data.contaId,
          { status: novoStatus } as any,
          transaction,
        );
      } else {
        await this.accountReceivableRepository.update(
          data.contaId,
          { status: novoStatus } as any,
          transaction,
        );
      }

      // 7h. Validate integrity post-operation
      const parcelasParaValidacao = [
        ...parcelasPagasOuParciais.map((p) => ({
          valor: Number(p.valor),
          status: p.status,
        })),
        ...novasParcelas.map((p) => ({
          valor: Number(p.valor),
          status: p.status,
        })),
      ];

      this.installmentValidation.validateIntegrity(
        parcelasParaValidacao,
        Number(account.valor),
      );

      return novasParcelas;
    });
  }

  /**
   * Derives the account status based on active installments.
   * - PENDENTE: no active installment has any payment (valorPago = 0 for all)
   * - PARCIAL: at least one active installment has status PAGO or PARCIAL but not all
   * - PAGO/RECEBIDO: all active installments have status PAGO
   */
  private deriveAccountStatus(
    parcelasAtivas: Installment[],
    tipoConta: 'PAGAR' | 'RECEBER',
  ): string {
    if (parcelasAtivas.length === 0) {
      return 'PENDENTE';
    }

    const todasPagas = parcelasAtivas.every((p) => p.status === 'PAGO');
    if (todasPagas) {
      return tipoConta === 'PAGAR' ? 'PAGO' : 'RECEBIDO';
    }

    const algumaPagaOuParcial = parcelasAtivas.some(
      (p) => p.status === 'PAGO' || p.status === 'PARCIAL',
    );
    if (algumaPagaOuParcial) {
      return 'PARCIAL';
    }

    return 'PENDENTE';
  }

  private async findAccount(
    contaId: string,
    tipoConta: 'PAGAR' | 'RECEBER',
  ): Promise<any> {
    if (tipoConta === 'PAGAR') {
      const account = await this.accountPayableRepository.findById(contaId);
      if (!account) {
        throw new HttpException(
          'Conta a pagar não encontrada',
          HttpStatus.NOT_FOUND,
        );
      }
      return account;
    } else {
      const account = await this.accountReceivableRepository.findById(contaId);
      if (!account) {
        throw new HttpException(
          'Conta a receber não encontrada',
          HttpStatus.NOT_FOUND,
        );
      }
      return account;
    }
  }
}
