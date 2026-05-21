import { Inject } from "@nestjs/common";
import { IClientRepository } from "../../domain/repository/client.interface.repository";

export class ClientRepository implements IClientRepository {
  
  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly connection: any
  ) {}
  
  async create(data: any, transaction: any): Promise<any> {
    const db = transaction || this.connection();
    return db.one(
      `INSERT INTO cliente (pessoa_id, taxa_desconto, limit_credito)
       VALUES ($1, $2, $3) RETURNING *`,
      [data.pessoaId, data.taxaDesconto, data.limiteCredito]
    );
  }

  async findById(id: string): Promise<any | null> {
    const db = this.connection();
    return db.oneOrNone(
      `SELECT 
        c.id,
        c.pessoa_id,
        c.taxa_desconto,
        c.limit_credito,
        p.nome,
        p.email,
        p.tipo
      FROM cliente c
      INNER JOIN pessoa p ON p.id = c.pessoa_id
      WHERE c.id = $1 AND p.ativo = true`,
      [id]
    );
  }

  async findAll(page: number, limit: number): Promise<{ data: any[]; total: number }> {
    const db = this.connection();
    const offset = (page - 1) * limit;

    const data = await db.any(
      `SELECT 
        c.id,
        c.pessoa_id,
        c.taxa_desconto,
        c.limit_credito,
        p.nome,
        p.email,
        p.tipo
      FROM cliente c
      INNER JOIN pessoa p ON p.id = c.pessoa_id
      WHERE p.ativo = true
      ORDER BY p.nome ASC
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await db.one(
      `SELECT COUNT(*) as total
      FROM cliente c
      INNER JOIN pessoa p ON p.id = c.pessoa_id
      WHERE p.ativo = true`
    );

    return { data, total: parseInt(countResult.total, 10) };
  }

  async update(id: string, data: any, transaction?: any): Promise<any> {
    const db = transaction || this.connection();
    return db.one(
      `UPDATE cliente 
      SET taxa_desconto = COALESCE($2, taxa_desconto),
          limit_credito = COALESCE($3, limit_credito)
      WHERE id = $1
      RETURNING *`,
      [id, data.taxaDesconto ?? null, data.limiteCredito ?? null]
    );
  }

  async delete(id: string): Promise<void> {
    const db = this.connection();
    await db.none(
      `UPDATE pessoa 
      SET ativo = false
      WHERE id = (SELECT pessoa_id FROM cliente WHERE id = $1)`,
      [id]
    );
  }
}