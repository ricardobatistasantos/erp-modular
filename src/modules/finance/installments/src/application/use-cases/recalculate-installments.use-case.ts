import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { RecalculateInstallmentsDTO } from '../dto/recalculate-installments.dto';
import { Installment } from '../../domain/entity/installment.entity';
import { IInstallmentRepository } from '../../domain/repository/installment.interface.repository';
import { IAccountPayableRepository } from '../../../../accounts-payable/src/domain/repository/account-payable.interface.repository';
import { IAccountReceivableRepository } from '../../../../accounts-receivable/src/domain/repository/account-receivable.interface.repository';
import { InstallmentCalculator } from '../../domain/services/installment-calculator';
import { InstallmentValidation } from '../../domain/validation/installment-validation';

export class RecalculateInstallmentsUseCase
  implements BaseUseCase<RecalculateInstallmentsDTO, Installment[]>
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

  async execute(data: RecalculateInstallmentsDTO): Promise<Installment[]> {
    // 1. Fetch account by ID based on tipoConta
    const account = await this.findAccount(data.contaId, data.tipoConta);

    // 2. Fetch all installments by origemId
    const todasParcelas = await this.installmentRepository.findByOrigemId(
      data.contaId,
    );

    // 3. Calculate sum of valorPago from non-cancelled installments
    const parcelasNaoCanceladas = todasParcelas.filter(
      (p) => p.status !== 'CANCELADO',
    );
    const somaValorPago =
      Math.round(
        parcelasNaoCanceladas.reduce((acc, p) => acc + Number(p.valorPago), 0) *
          100,
      ) / 100;

    // 4. Validate: new value >= sum of valorPago
    if (data.novoValorTotal < somaValorPago) {
      throw new HttpException(
        `Novo valor (R$ ${data.novoValorTotal.toFixed(2)}) não pode ser inferior ao valor já liquidado (R$ ${somaValorPago.toFixed(2)})`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // 5. Find PENDENTE installments and validate at least one exists
    const parcelasPendentes = todasParcelas.filter(
      (p) => p.status === 'PENDENTE',
    );
    if (parcelasPendentes.length === 0) {
      throw new HttpException(
        'Não há parcelas pendentes disponíveis para redistribuição',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 6. Calculate valorRestante = novoValorTotal - somaValorPago
    const valorRestante =
      Math.round((data.novoValorTotal - somaValorPago) * 100) / 100;

    // 7. Use InstallmentCalculator.recalculate() to redistribute among PENDENTES
    const parcelasRecalculadas = this.installmentCalculator.recalculate(
      valorRestante,
      parcelasPendentes.map((p) => ({
        numeroParcela: p.numeroParcela,
        dataVencimento: p.dataVencimento,
      })),
    );

    // 8. In a transaction: update each PENDENTE installment's valor and update account's valor
    return this.connection().tx(async (transaction: any) => {
      const parcelasAtualizadas: Installment[] = [];

      for (let i = 0; i < parcelasPendentes.length; i++) {
        const parcela = parcelasPendentes[i];
        const novoValor = parcelasRecalculadas[i].valor;

        const atualizada = await this.installmentRepository.updateValor(
          parcela.id,
          novoValor,
          transaction,
        );
        parcelasAtualizadas.push(atualizada);
      }

      // Update account's valor
      if (data.tipoConta === 'PAGAR') {
        await this.accountPayableRepository.update(
          data.contaId,
          { valor: data.novoValorTotal } as any,
          transaction,
        );
      } else {
        await this.accountReceivableRepository.update(
          data.contaId,
          { valor: data.novoValorTotal } as any,
          transaction,
        );
      }

      // 9. Validate integrity post-operation
      const todasParcelasAtualizadas =
        await this.buildParcelasParaValidacao(
          todasParcelas,
          parcelasPendentes,
          parcelasAtualizadas,
        );

      this.installmentValidation.validateIntegrity(
        todasParcelasAtualizadas,
        data.novoValorTotal,
      );

      return parcelasAtualizadas;
    });
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

  /**
   * Builds the full list of installments for integrity validation,
   * replacing PENDENTE installments with their updated values.
   */
  private buildParcelasParaValidacao(
    todasParcelas: Installment[],
    parcelasPendentes: Installment[],
    parcelasAtualizadas: Installment[],
  ): { valor: number; status: string }[] {
    const pendentesIds = new Set(parcelasPendentes.map((p) => p.id));
    const atualizadasMap = new Map(
      parcelasAtualizadas.map((p) => [p.id, p]),
    );

    return todasParcelas.map((p) => {
      if (pendentesIds.has(p.id)) {
        const atualizada = atualizadasMap.get(p.id);
        return {
          valor: Number(atualizada?.valor ?? p.valor),
          status: atualizada?.status ?? p.status,
        };
      }
      return { valor: Number(p.valor), status: p.status };
    });
  }
}
