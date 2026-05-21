import { Inject } from '@nestjs/common';
import { IAccountPayableRepository } from '../../domain/repository/account-payable.interface.repository';
import { AccountPayable } from '../../domain/entity/account-payable.entity';
import { CreateAccountPayableDTO } from '../../application/dto/create-account-payable.dto';
import { UpdateAccountPayableDTO } from '../../application/dto/update-account-payable.dto';

export class AccountPayableRepository implements IAccountPayableRepository {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly connection: any,
  ) {}

  async create(data: CreateAccountPayableDTO, transaction?: any): Promise<AccountPayable> {
    const db = transaction || this.connection();
    return db.one(
      `INSERT INTO contas_pagar (id, pessoa_id, numero_documento, descricao, categoria_financeira_id, centro_custo_id, conta_bancaria_id, data_emissao, data_vencimento, valor, valor_pago, status, forma_pagamento)
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

  async findById(id: string): Promise<AccountPayable | null> {
    const db = this.connection();
    return db.oneOrNone(
      `SELECT * FROM contas_pagar WHERE id = $1`,
      [id],
    );
  }

  async findAll(page: number, limit: number): Promise<{ data: AccountPayable[]; total: number }> {
    const db = this.connection();
    const offset = (page - 1) * limit;

    const data = await db.any(
      `SELECT * FROM contas_pagar ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    const countResult = await db.one(
      `SELECT COUNT(*) as total FROM contas_pagar`,
    );

    return { data, total: parseInt(countResult.total, 10) };
  }

  async update(id: string, data: UpdateAccountPayableDTO, transaction?: any): Promise<AccountPayable> {
    const db = transaction || this.connection();
    return db.one(
      `UPDATE contas_pagar
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

  async updateValorPago(id: string, valorPago: number, status: string, transaction?: any): Promise<AccountPayable> {
    const db = transaction || this.connection();
    return db.one(
      `UPDATE contas_pagar
       SET valor_pago = $2, status = $3, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, valorPago, status],
    );
  }
}
