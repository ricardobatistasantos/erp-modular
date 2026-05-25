import { Inject } from "@nestjs/common";
import { ISupplierRepository } from "../../domain/repository/supplier.interface.repository";

export class SupplierRepository implements ISupplierRepository {

  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly connection: any
  ) {}

  async create(data: any, transaction?: any): Promise<any> {
    const db = transaction || this.connection();
    return db.one(
      `INSERT INTO fornecedor (pessoa_id, categoria, prazo_entrega_dias)
       VALUES ($1, $2, $3) RETURNING *`,
      [data.pessoaId, data.categoria, data.prazoEntregaDias]
    );
  }

  async findById(id: string): Promise<any | null> {
    const db = this.connection();
    return db.oneOrNone(
      `SELECT 
        f.id,
        f.pessoa_id,
        f.categoria,
        f.prazo_entrega_dias,
        p.nome,
        p.email,
        p.tipo
      FROM fornecedor f
      INNER JOIN pessoa p ON p.id = f.pessoa_id
      WHERE f.id = $1 AND p.ativo = true`,
      [id]
    );
  }

  async findAll(page: number, limit: number): Promise<{ data: any[]; total: number }> {
    const db = this.connection();
    const offset = (page - 1) * limit;

    const data = await db.any(
      `SELECT 
        f.id,
        f.pessoa_id,
        f.categoria,
        f.prazo_entrega_dias,
        p.nome,
        p.email,
        p.tipo
      FROM fornecedor f
      INNER JOIN pessoa p ON p.id = f.pessoa_id
      WHERE p.ativo = true
      ORDER BY p.nome ASC
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await db.one(
      `SELECT COUNT(*) as total
      FROM fornecedor f
      INNER JOIN pessoa p ON p.id = f.pessoa_id
      WHERE p.ativo = true`
    );

    return { data, total: parseInt(countResult.total, 10) };
  }

  async update(id: string, data: any, transaction?: any): Promise<any> {
    const db = transaction || this.connection();
    return db.one(
      `UPDATE fornecedor 
      SET categoria = COALESCE($2, categoria),
          prazo_entrega_dias = COALESCE($3, prazo_entrega_dias)
      WHERE id = $1
      RETURNING *`,
      [id, data.categoria ?? null, data.prazoEntregaDias ?? null]
    );
  }

  async delete(id: string): Promise<void> {
    const db = this.connection();
    await db.none(
      `UPDATE pessoa 
      SET ativo = false
      WHERE id = (SELECT pessoa_id FROM fornecedor WHERE id = $1)`,
      [id]
    );
  }
}
