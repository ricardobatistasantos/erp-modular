import { Inject } from '@nestjs/common';
import { IBankRepository } from '../../domain/repository/bank.interface.repository';
import { Bank } from '../../domain/entity/bank.entity';
import { CreateBankDTO } from '../../application/dto/create-bank.dto';
import { UpdateBankDTO } from '../../application/dto/update-bank.dto';

export class BankRepository implements IBankRepository {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly connection: any,
  ) {}

  async create(data: CreateBankDTO): Promise<Bank> {
    const db = this.connection();
    const row = await db.one(
      `INSERT INTO banco (id, codigo, nome, url_site)
       VALUES (gen_random_uuid(), $1, $2, $3) RETURNING *`,
      [data.codigo, data.nome, data.urlSite ?? null],
    );
    return this.mapToEntity(row);
  }

  async findById(id: string): Promise<Bank | null> {
    const db = this.connection();
    const row = await db.oneOrNone(
      `SELECT * FROM banco WHERE id = $1`,
      [id],
    );
    return row ? this.mapToEntity(row) : null;
  }

  async findAll(page: number, limit: number): Promise<{ data: Bank[]; total: number }> {
    const db = this.connection();
    const offset = (page - 1) * limit;

    const rows = await db.any(
      `SELECT * FROM banco ORDER BY nome LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    const countResult = await db.one(
      `SELECT COUNT(*) as total FROM banco`,
    );

    return {
      data: rows.map((row) => this.mapToEntity(row)),
      total: parseInt(countResult.total, 10),
    };
  }

  async update(id: string, data: UpdateBankDTO): Promise<Bank> {
    const db = this.connection();
    const row = await db.one(
      `UPDATE banco SET codigo = COALESCE($2, codigo), nome = COALESCE($3, nome),
        url_site = COALESCE($4, url_site) WHERE id = $1 RETURNING *`,
      [id, data.codigo ?? null, data.nome ?? null, data.urlSite ?? null],
    );
    return this.mapToEntity(row);
  }

  async delete(id: string): Promise<void> {
    const db = this.connection();
    await db.none(`DELETE FROM banco WHERE id = $1`, [id]);
  }

  private mapToEntity(row: any): Bank {
    const bank = new Bank();
    bank.id = row.id;
    bank.codigo = row.codigo;
    bank.nome = row.nome;
    bank.urlSite = row.url_site;
    return bank;
  }
}
