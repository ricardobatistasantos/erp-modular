import { Inject, Injectable } from '@nestjs/common';
import { ISaldoEstoqueRepository } from '../../domain/repository/saldo-estoque.repository';
import { SaldoEstoque } from '../../domain/entity/saldo-estoque.entity';

@Injectable()
export class SaldoEstoqueRepository implements ISaldoEstoqueRepository {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly connection: any,
  ) {}

  async upsert(saldo: SaldoEstoque, transaction?: any): Promise<SaldoEstoque> {
    const db = transaction || this.connection();
    const row = await db.one(
      `INSERT INTO saldo_estoque (id, produto_id, deposito_id, endereco_id, lote_id, saldo_quantidade, reservado, custo_medio, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW())
       ON CONFLICT (produto_id, deposito_id, COALESCE(endereco_id, ''), COALESCE(lote_id, ''))
       DO UPDATE SET saldo_quantidade = EXCLUDED.saldo_quantidade,
                     reservado = EXCLUDED.reservado,
                     custo_medio = EXCLUDED.custo_medio,
                     updated_at = NOW()
       RETURNING *`,
      [
        saldo.produtoId,
        saldo.depositoId,
        saldo.enderecoId ?? null,
        saldo.loteId ?? null,
        saldo.saldoQuantidade,
        saldo.reservado,
        saldo.custoMedio,
      ],
    );
    return this.toEntity(row);
  }

  async findByProdutoId(produtoId: string, transaction?: any): Promise<SaldoEstoque[]> {
    const db = transaction || this.connection();
    const rows = await db.any(
      `SELECT * FROM saldo_estoque WHERE produto_id = $1`,
      [produtoId],
    );
    return rows.map((row) => this.toEntity(row));
  }

  async findByDepositoId(depositoId: string, transaction?: any): Promise<SaldoEstoque[]> {
    const db = transaction || this.connection();
    const rows = await db.any(
      `SELECT * FROM saldo_estoque WHERE deposito_id = $1`,
      [depositoId],
    );
    return rows.map((row) => this.toEntity(row));
  }

  async findByProdutoAndDeposito(
    produtoId: string,
    depositoId: string,
    transaction?: any,
  ): Promise<SaldoEstoque | null> {
    const db = transaction || this.connection();
    const row = await db.oneOrNone(
      `SELECT * FROM saldo_estoque WHERE produto_id = $1 AND deposito_id = $2`,
      [produtoId, depositoId],
    );
    return row ? this.toEntity(row) : null;
  }

  private toEntity(row: any): SaldoEstoque {
    return new SaldoEstoque({
      id: row.id,
      produtoId: row.produto_id,
      depositoId: row.deposito_id,
      enderecoId: row.endereco_id || undefined,
      loteId: row.lote_id || undefined,
      saldoQuantidade: parseFloat(row.saldo_quantidade),
      reservado: parseFloat(row.reservado),
      custoMedio: parseFloat(row.custo_medio),
      updatedAt: row.updated_at,
    });
  }
}
