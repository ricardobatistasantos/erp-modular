import { Inject } from '@nestjs/common';
import { IFinancialSettlementRepository } from '../../domain/repository/financial-settlement.interface.repository';
import { FinancialSettlement } from '../../domain/entity/financial-settlement.entity';

export class FinancialSettlementRepository implements IFinancialSettlementRepository {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly connection: any,
  ) {}

  async create(data: any, transaction?: any): Promise<FinancialSettlement> {
    const db = transaction || this.connection();
    return db.one(
      `INSERT INTO baixas_financeiras (id, tipo_conta, parcela_id, valor, juros, multa, desconto, valor_liquido, data_pagamento, forma_pagamento, conta_bancaria_id, caixa_id, lancamento_financeiro_id, observacao)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [
        data.tipoConta,
        data.parcelaId,
        data.valor,
        data.juros ?? 0,
        data.multa ?? 0,
        data.desconto ?? 0,
        data.valorLiquido,
        data.dataPagamento,
        data.formaPagamento,
        data.contaBancariaId ?? null,
        data.caixaId ?? null,
        data.lancamentoFinanceiroId,
        data.observacao ?? null,
      ],
    );
  }

  async findById(id: string): Promise<FinancialSettlement | null> {
    const db = this.connection();
    return db.oneOrNone(
      `SELECT * FROM baixas_financeiras WHERE id = $1`,
      [id],
    );
  }

  async findByParcelaId(parcelaId: string): Promise<FinancialSettlement[]> {
    const db = this.connection();
    return db.any(
      `SELECT * FROM baixas_financeiras WHERE parcela_id = $1 ORDER BY data_pagamento ASC`,
      [parcelaId],
    );
  }

  async existsByParcelaId(parcelaId: string): Promise<boolean> {
    const db = this.connection();
    const result = await db.one(
      `SELECT EXISTS(SELECT 1 FROM baixas_financeiras WHERE parcela_id = $1) AS exists`,
      [parcelaId],
    );
    return result.exists;
  }
}
