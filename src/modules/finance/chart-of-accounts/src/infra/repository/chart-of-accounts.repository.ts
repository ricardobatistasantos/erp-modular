import { Inject } from '@nestjs/common';
import { IChartOfAccountsRepository } from '../../domain/repository/chart-of-accounts.interface.repository';
import { ChartOfAccounts } from '../../domain/entity/chart-of-accounts.entity';
import { CreateChartOfAccountsDTO } from '../../application/dto/create-chart-of-accounts.dto';
import { UpdateChartOfAccountsDTO } from '../../application/dto/update-chart-of-accounts.dto';

export class ChartOfAccountsRepository implements IChartOfAccountsRepository {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly connection: any,
  ) {}

  async create(data: CreateChartOfAccountsDTO, transaction?: any): Promise<ChartOfAccounts> {
    const db = transaction || this.connection();
    return db.one(
      `INSERT INTO plano_contas (id, codigo, nome, tipo, natureza, conta_pai_id, aceita_lancamento)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6) RETURNING *`,
      [data.codigo, data.nome, data.tipo, data.natureza, data.contaPaiId ?? null, data.aceitaLancamento],
    );
  }

  async findById(id: string): Promise<ChartOfAccounts | null> {
    const db = this.connection();
    return db.oneOrNone(
      `SELECT * FROM plano_contas WHERE id = $1`,
      [id],
    );
  }

  async findAll(page: number, limit: number): Promise<{ data: ChartOfAccounts[]; total: number }> {
    const db = this.connection();
    const offset = (page - 1) * limit;

    const data = await db.any(
      `SELECT * FROM plano_contas ORDER BY codigo ASC LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    const countResult = await db.one(
      `SELECT COUNT(*) as total FROM plano_contas`,
    );

    return { data, total: parseInt(countResult.total, 10) };
  }

  async update(id: string, data: UpdateChartOfAccountsDTO, transaction?: any): Promise<ChartOfAccounts> {
    const db = transaction || this.connection();
    return db.one(
      `UPDATE plano_contas
       SET codigo = COALESCE($2, codigo),
           nome = COALESCE($3, nome),
           tipo = COALESCE($4, tipo),
           natureza = COALESCE($5, natureza),
           conta_pai_id = COALESCE($6, conta_pai_id),
           aceita_lancamento = COALESCE($7, aceita_lancamento),
           ativo = COALESCE($8, ativo),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [
        id,
        data.codigo ?? null,
        data.nome ?? null,
        data.tipo ?? null,
        data.natureza ?? null,
        data.contaPaiId ?? null,
        data.aceitaLancamento ?? null,
        data.ativo ?? null,
      ],
    );
  }

  async findByCodigo(codigo: string): Promise<ChartOfAccounts | null> {
    const db = this.connection();
    return db.oneOrNone(
      `SELECT * FROM plano_contas WHERE codigo = $1`,
      [codigo],
    );
  }
}
