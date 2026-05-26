import { Inject, Injectable } from '@nestjs/common';
import { IDepositoRepository } from '../../domain/repository/deposito.repository';
import { Deposito } from '../../domain/entity/deposito.entity';

@Injectable()
export class DepositoRepository implements IDepositoRepository {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly connection: any,
  ) {}

  async create(deposito: Deposito): Promise<Deposito> {
    const db = this.connection();
    const row = await db.one(
      `INSERT INTO depositos (id, empresa_id, nome, ativo, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, NOW())
       RETURNING *`,
      [deposito.empresaId, deposito.nome, deposito.ativo],
    );
    return this.toEntity(row);
  }

  async findById(id: string): Promise<Deposito | null> {
    const db = this.connection();
    const row = await db.oneOrNone(
      `SELECT * FROM depositos WHERE id = $1`,
      [id],
    );
    return row ? this.toEntity(row) : null;
  }

  async findAll(empresaId: string): Promise<Deposito[]> {
    const db = this.connection();
    const rows = await db.any(
      `SELECT * FROM depositos WHERE empresa_id = $1 ORDER BY created_at DESC`,
      [empresaId],
    );
    return rows.map((row) => this.toEntity(row));
  }

  async update(deposito: Deposito): Promise<Deposito> {
    const db = this.connection();
    const row = await db.one(
      `UPDATE depositos
       SET nome = COALESCE($2, nome),
           ativo = COALESCE($3, ativo)
       WHERE id = $1
       RETURNING *`,
      [deposito.id, deposito.nome ?? null, deposito.ativo ?? null],
    );
    return this.toEntity(row);
  }

  private toEntity(row: any): Deposito {
    return new Deposito({
      id: row.id,
      empresaId: row.empresa_id,
      nome: row.nome,
      ativo: row.ativo,
      createdAt: row.created_at,
    });
  }
}
