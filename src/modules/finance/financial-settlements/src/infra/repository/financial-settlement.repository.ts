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
      `INSERT INTO baixas_financeiras (id, tipo_conta, conta_id, valor, data_pagamento, forma_pagamento, conta_bancaria_id, caixa_id, lancamento_financeiro_id, observacao)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        data.tipoConta,
        data.contaId,
        data.valor,
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

  async findByContaId(contaId: string): Promise<FinancialSettlement[]> {
    const db = this.connection();
    return db.any(
      `SELECT * FROM baixas_financeiras WHERE conta_id = $1`,
      [contaId],
    );
  }
}
