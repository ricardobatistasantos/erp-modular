import { Inject, Injectable } from '@nestjs/common';
import { IInventarioRepository } from '../../domain/repository/inventario.repository';
import { Inventario } from '../../domain/entity/inventario.entity';
import { InventarioItem } from '../../domain/entity/inventario-item.entity';

@Injectable()
export class InventarioRepository implements IInventarioRepository {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly connection: any,
  ) {}

  async create(inventario: Inventario, transaction?: any): Promise<Inventario> {
    const db = transaction || this.connection();
    const row = await db.one(
      `INSERT INTO inventarios (id, deposito_id, status, iniciado_em, finalizado_em, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW())
       RETURNING *`,
      [
        inventario.depositoId,
        inventario.status,
        inventario.iniciadoEm ?? null,
        inventario.finalizadoEm ?? null,
      ],
    );
    return this.toInventarioEntity(row);
  }

  async findById(id: string): Promise<Inventario | null> {
    const db = this.connection();
    const row = await db.oneOrNone(
      `SELECT * FROM inventarios WHERE id = $1`,
      [id],
    );
    return row ? this.toInventarioEntity(row) : null;
  }

  async update(id: string, data: Partial<Inventario>): Promise<Inventario> {
    const db = this.connection();
    const row = await db.one(
      `UPDATE inventarios
       SET status = COALESCE($2, status),
           iniciado_em = COALESCE($3, iniciado_em),
           finalizado_em = COALESCE($4, finalizado_em)
       WHERE id = $1
       RETURNING *`,
      [
        id,
        data.status ?? null,
        data.iniciadoEm ?? null,
        data.finalizadoEm ?? null,
      ],
    );
    return this.toInventarioEntity(row);
  }

  async createItem(item: InventarioItem, transaction?: any): Promise<InventarioItem> {
    const db = transaction || this.connection();
    const row = await db.one(
      `INSERT INTO inventario_itens (id, inventario_id, produto_id, saldo_sistema, saldo_fisico)
       VALUES (gen_random_uuid(), $1, $2, $3, $4)
       RETURNING *`,
      [item.inventarioId, item.produtoId, item.saldoSistema, item.saldoFisico],
    );
    return this.toItemEntity(row);
  }

  async finalize(id: string, transaction?: any): Promise<Inventario> {
    const db = transaction || this.connection();
    const row = await db.one(
      `UPDATE inventarios
       SET status = 'FINALIZADO',
           finalizado_em = NOW()
       WHERE id = $1
       RETURNING *`,
      [id],
    );
    return this.toInventarioEntity(row);
  }

  async findItensByInventarioId(inventarioId: string): Promise<InventarioItem[]> {
    const db = this.connection();
    const rows = await db.any(
      `SELECT * FROM inventario_itens WHERE inventario_id = $1`,
      [inventarioId],
    );
    return rows.map((row) => this.toItemEntity(row));
  }

  async updateItem(item: InventarioItem): Promise<InventarioItem> {
    const db = this.connection();
    const row = await db.one(
      `UPDATE inventario_itens
       SET saldo_sistema = $2,
           saldo_fisico = $3
       WHERE id = $1
       RETURNING *`,
      [item.id, item.saldoSistema, item.saldoFisico],
    );
    return this.toItemEntity(row);
  }

  private toInventarioEntity(row: any): Inventario {
    return new Inventario({
      id: row.id,
      depositoId: row.deposito_id,
      status: row.status,
      iniciadoEm: row.iniciado_em,
      finalizadoEm: row.finalizado_em,
      createdAt: row.created_at,
    });
  }

  private toItemEntity(row: any): InventarioItem {
    return new InventarioItem({
      id: row.id,
      inventarioId: row.inventario_id,
      produtoId: row.produto_id,
      saldoSistema: parseFloat(row.saldo_sistema),
      saldoFisico: parseFloat(row.saldo_fisico),
    });
  }
}
