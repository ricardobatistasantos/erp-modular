import { Inject } from '@nestjs/common';
import { IAccountReceivableRepository } from '../../domain/repository/account-receivable.interface.repository';
import { AccountReceivable } from '../../domain/entity/account-receivable.entity';
import { CreateAccountReceivableDTO } from '../../application/dto/create-account-receivable.dto';
import { UpdateAccountReceivableDTO } from '../../application/dto/update-account-receivable.dto';

export class AccountReceivableRepository implements IAccountReceivableRepository {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly connection: any,
  ) {}

  async create(data: CreateAccountReceivableDTO, transaction?: any): Promise<AccountReceivable> {
    const db = transaction || this.connection();
    return db.one(
      `INSERT INTO contas_receber (id, pessoa_id, numero_documento, descricao, categoria_financeira_id, centro_custo_id, conta_bancaria_id, data_emissao, data_vencimento, valor, valor_recebido, status, forma_pagamento)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, 0, 'PENDENTE', $10) RETURNING *`,
      [
        data.pessoaId,
        data.numeroDocumento,
        data.descricao,
        data.categoriaFinanceiraId,
        data.centroCustoId ?? null,
        data.contaBancariaId ?? null,
        data.dataEmissao,
        data.dataVencimento,
        data.valor,
        data.formaPagamento ?? null,
      ],
    );
  }

  async findById(id: string): Promise<AccountReceivable | null> {
    const db = this.connection();
    return db.oneOrNone(
      `SELECT * FROM contas_receber WHERE id = $1`,
      [id],
    );
  }

  async findAll(page: number, limit: number): Promise<{ data: AccountReceivable[]; total: number }> {
    const db = this.connection();
    const offset = (page - 1) * limit;

    const data = await db.any(
      `SELECT * FROM contas_receber ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    const countResult = await db.one(
      `SELECT COUNT(*) as total FROM contas_receber`,
    );

    return { data, total: parseInt(countResult.total, 10) };
  }

  async update(id: string, data: UpdateAccountReceivableDTO, transaction?: any): Promise<AccountReceivable> {
    const db = transaction || this.connection();
    return db.one(
      `UPDATE contas_receber
       SET numero_documento = COALESCE($2, numero_documento),
           descricao = COALESCE($3, descricao),
           categoria_financeira_id = COALESCE($4, categoria_financeira_id),
           centro_custo_id = COALESCE($5, centro_custo_id),
           conta_bancaria_id = COALESCE($6, conta_bancaria_id),
           data_emissao = COALESCE($7, data_emissao),
           data_vencimento = COALESCE($8, data_vencimento),
           valor = COALESCE($9, valor),
           forma_pagamento = COALESCE($10, forma_pagamento),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [
        id,
        data.numeroDocumento ?? null,
        data.descricao ?? null,
        data.categoriaFinanceiraId ?? null,
        data.centroCustoId ?? null,
        data.contaBancariaId ?? null,
        data.dataEmissao ?? null,
        data.dataVencimento ?? null,
        data.valor ?? null,
        data.formaPagamento ?? null,
      ],
    );
  }

  async updateValorRecebido(id: string, valorRecebido: number, status: string, transaction?: any): Promise<AccountReceivable> {
    const db = transaction || this.connection();
    return db.one(
      `UPDATE contas_receber
       SET valor_recebido = $2, status = $3, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, valorRecebido, status],
    );
  }
}
