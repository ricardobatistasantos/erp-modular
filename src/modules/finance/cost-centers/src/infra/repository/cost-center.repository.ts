import { Inject } from '@nestjs/common';
import { ICostCenterRepository } from '../../domain/repository/cost-center.interface.repository';
import { CostCenter } from '../../domain/entity/cost-center.entity';
import { CreateCostCenterDTO } from '../../application/dto/create-cost-center.dto';
import { UpdateCostCenterDTO } from '../../application/dto/update-cost-center.dto';

export class CostCenterRepository implements ICostCenterRepository {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly connection: any,
  ) {}

  async create(data: CreateCostCenterDTO, transaction?: any): Promise<CostCenter> {
    const db = transaction || this.connection();
    return db.one(
      `INSERT INTO centro_custos (id, codigo, nome, descricao, centro_pai_id, ativo)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, true) RETURNING *`,
      [data.codigo, data.nome, data.descricao ?? null, data.centroPaiId ?? null],
    );
  }

  async findById(id: string): Promise<CostCenter | null> {
    const db = this.connection();
    return db.oneOrNone(
      `SELECT * FROM centro_custos WHERE id = $1`,
      [id],
    );
  }

  async findAll(page: number, limit: number): Promise<{ data: CostCenter[]; total: number }> {
    const db = this.connection();
    const offset = (page - 1) * limit;

    const data = await db.any(
      `SELECT * FROM centro_custos ORDER BY nome ASC LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    const countResult = await db.one(
      `SELECT COUNT(*) as total FROM centro_custos`,
    );

    return { data, total: parseInt(countResult.total, 10) };
  }

  async update(id: string, data: UpdateCostCenterDTO, transaction?: any): Promise<CostCenter> {
    const db = transaction || this.connection();
    return db.one(
      `UPDATE centro_custos
       SET codigo = COALESCE($2, codigo),
           nome = COALESCE($3, nome),
           descricao = COALESCE($4, descricao),
           centro_pai_id = COALESCE($5, centro_pai_id),
           ativo = COALESCE($6, ativo),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [
        id,
        data.codigo ?? null,
        data.nome ?? null,
        data.descricao ?? null,
        data.centroPaiId ?? null,
        data.ativo ?? null,
      ],
    );
  }

  async findByCodigo(codigo: string): Promise<CostCenter | null> {
    const db = this.connection();
    return db.oneOrNone(
      `SELECT * FROM centro_custos WHERE codigo = $1`,
      [codigo],
    );
  }
}
