import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { CreateFinancialSettlementDTO } from '../dto/create-financial-settlement.dto';
import { FinancialSettlement } from '../../domain/entity/financial-settlement.entity';
import { IFinancialSettlementRepository } from '../../domain/repository/financial-settlement.interface.repository';
import { IAccountPayableRepository } from '../../../../accounts-payable/src/domain/repository/account-payable.interface.repository';
import { IAccountReceivableRepository } from '../../../../accounts-receivable/src/domain/repository/account-receivable.interface.repository';
import { IFinancialEntryRepository } from '../../../../financial-entries/src/domain/repository/financial-entry.interface.repository';

export class CreateFinancialSettlementUseCase implements BaseUseCase<CreateFinancialSettlementDTO, FinancialSettlement> {
  constructor(
    @Inject('IFinancialSettlementRepository')
    private readonly repository: IFinancialSettlementRepository,
    @Inject('IAccountPayableRepository')
    private readonly accountPayableRepository: IAccountPayableRepository,
    @Inject('IAccountReceivableRepository')
    private readonly accountReceivableRepository: IAccountReceivableRepository,
    @Inject('IFinancialEntryRepository')
    private readonly financialEntryRepository: IFinancialEntryRepository,
    @Inject('DATABASE_CONNECTION')
    private readonly connection: any,
  ) {}

  async execute(data: CreateFinancialSettlementDTO): Promise<FinancialSettlement> {
    return this.connection().tx(async (transaction) => {
      // 1. Find account based on tipoConta and validate existence
      let account;
      if (data.tipoConta === 'PAGAR') {
        account = await this.accountPayableRepository.findById(data.contaId);
        if (!account) {
          throw new HttpException(
            'Conta a pagar não encontrada',
            HttpStatus.NOT_FOUND,
          );
        }
      } else {
        account = await this.accountReceivableRepository.findById(data.contaId);
        if (!account) {
          throw new HttpException(
            'Conta a receber não encontrada',
            HttpStatus.NOT_FOUND,
          );
        }
      }

      // 2. Validate that settlement value doesn't exceed remaining balance
      const valorPagoAtual = data.tipoConta === 'PAGAR' ? account.valorPago : account.valorRecebido;
      const saldoRestante = account.valor - valorPagoAtual;
      if (data.valor > saldoRestante) {
        throw new HttpException(
          'Valor excede o saldo restante da conta',
          HttpStatus.BAD_REQUEST,
        );
      }

      // 3. Create financial entry (DESPESA for PAGAR, RECEITA for RECEBER, origem='BAIXA')
      const entryData = {
        tipo: data.tipoConta === 'PAGAR' ? 'DESPESA' : 'RECEITA',
        origem: 'BAIXA',
        origemId: data.contaId,
        planoContaId: account.categoriaFinanceiraId,
        dataLancamento: data.dataPagamento,
        descricao: `Baixa financeira - ${data.tipoConta}`,
        valor: data.valor,
        contaBancariaId: data.contaBancariaId || null,
        caixaId: data.caixaId || null,
      };
      const financialEntry = await this.financialEntryRepository.create(entryData, transaction);

      // 4. Create settlement record
      const settlementData = {
        ...data,
        lancamentoFinanceiroId: financialEntry.id,
      };
      const settlement = await this.repository.create(settlementData, transaction);

      // 5. Update valor_pago/valor_recebido and status if fully paid
      const novoValorPago = valorPagoAtual + data.valor;
      const novoStatus = novoValorPago >= account.valor
        ? (data.tipoConta === 'PAGAR' ? 'PAGO' : 'RECEBIDO')
        : account.status;

      if (data.tipoConta === 'PAGAR') {
        await this.accountPayableRepository.updateValorPago(data.contaId, novoValorPago, novoStatus, transaction);
      } else {
        await this.accountReceivableRepository.updateValorRecebido(data.contaId, novoValorPago, novoStatus, transaction);
      }

      return settlement;
    });
  }
}
