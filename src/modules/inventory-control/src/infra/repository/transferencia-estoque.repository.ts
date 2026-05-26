import { Inject, Injectable } from '@nestjs/common';
import { ITransferenciaEstoqueRepository } from '../../domain/repository/transferencia-estoque.repository';
import { TransferenciaEstoque } from '../../domain/entity/transferencia-estoque.entity';
import { TransferenciaItem } from '../../domain/entity/transferencia-item.entity';
import { StatusTransferenciaEstoque } from '../../domain/enums';

@Injectable()
export class TransferenciaEstoqueRepository implements ITransferenciaEstoqueRepository {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly connection: any,
  ) {}

  async create(transferencia: TransferenciaEstoque, itens: TransferenciaItem[]): Promise<TransferenciaEstoque> {
    const db = this.connection();
    return db.tx(async (t) => {
      const row = await t.one(
        `INSERT INTO transferencias_estoque (id, deposito_origem_id, deposito_destino_id, status, observacao, created_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW())
         RETURNING *`,
        [
          transferencia.depositoOrigemId,
          transferencia.depositoDestinoId,
          transferencia.status,
          transferencia.observacao ?? null,
        ],
      );

      for (const item of itens) {
        await t.none(
          `INSERT INTO transferencia_itens (id, transferencia_id, produto_id, quantidade)
           VALUES (gen_random_uuid(), $1, $2, $3)`,
          [row.id, item.produtoId, item.quantidade],
        );
      }

      return this.toTransferenciaEntity(row);
    });
  }

  async findById(id: string): Promise<TransferenciaEstoque | null> {
    const db = this.connection();
    const row = await db.oneOrNone(
      `SELECT * FROM transferencias_estoque WHERE id = $1`,
      [id],
    );
    return row ? this.toTransferenciaEntity(row) : null;
  }

  async updateStatus(id: string, status: StatusTransferenciaEstoque): Promise<TransferenciaEstoque> {
    const db = this.connection();
    const row = await db.one(
      `UPDATE transferencias_estoque SET status = $2 WHERE id = $1 RETURNING *`,
      [id, status],
    );
    return this.toTransferenciaEntity(row);
  }

  async createItem(item: TransferenciaItem): Promise<TransferenciaItem> {
    const db = this.connection();
    const row = await db.one(
      `INSERT INTO transferencia_itens (id, transferencia_id, produto_id, quantidade)
       VALUES (gen_random_uuid(), $1, $2, $3)
       RETURNING *`,
      [item.transferenciaId, item.produtoId, item.quantidade],
    );
    return this.toItemEntity(row);
  }

  async findItensByTransferenciaId(transferenciaId: string): Promise<TransferenciaItem[]> {
    const db = this.connection();
    const rows = await db.any(
      `SELECT * FROM transferencia_itens WHERE transferencia_id = $1`,
      [transferenciaId],
    );
    return rows.map((row) => this.toItemEntity(row));
  }

  private toTransferenciaEntity(row: any): TransferenciaEstoque {
    return new TransferenciaEstoque({
      id: row.id,
      depositoOrigemId: row.deposito_origem_id,
      depositoDestinoId: row.deposito_destino_id,
      status: row.status,
      observacao: row.observacao,
      createdAt: row.created_at,
    });
  }

  private toItemEntity(row: any): TransferenciaItem {
    return new TransferenciaItem({
      id: row.id,
      transferenciaId: row.transferencia_id,
      produtoId: row.produto_id,
      quantidade: parseFloat(row.quantidade),
    });
  }
}
