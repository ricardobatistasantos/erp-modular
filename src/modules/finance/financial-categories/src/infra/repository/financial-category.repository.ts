import { Inject } from '@nestjs/common';
import { IFinancialCategoryRepository } from '../../domain/repository/financial-category.interface.repository';
import { FinancialCategory } from '../../domain/entity/financial-category.entity';
import { CreateFinancialCategoryDTO } from '../../application/dto/create-financial-category.dto';
import { UpdateFinancialCategoryDTO } from '../../application/dto/update-financial-category.dto';

export class FinancialCategoryRepository implements IFinancialCategoryRepository {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly connection: any,
  ) {}

  async create(data: CreateFinancialCategoryDTO, transaction?: any): Promise<FinancialCategory> {
    const db = transaction || this.connection();
    return db.one(
      `INSERT INTO categorias_financeiras (id, nome, descricao, tipo, plano_conta_id, ativo)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, true) RETURNING *`,
      [data.nome, data.descricao ?? null, data.tipo, data.planoContaId ?? null],
    );
  }

  async findById(id: string): Promise<FinancialCategory | null> {
    const db = this.connection();
    return db.oneOrNone(
      `SELECT * FROM categorias_financeiras WHERE id = $1`,
      [id],
    );
  }

  async findAll(page: number, limit: number): Promise<{ data: FinancialCategory[]; total: number }> {
    const db = this.connection();
    const offset = (page - 1) * limit;

    const data = await db.any(
      `SELECT * FROM categorias_financeiras ORDER BY nome ASC LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    const countResult = await db.one(
      `SELECT COUNT(*) as total FROM categorias_financeiras`,
    );

    return { data, total: parseInt(countResult.total, 10) };
  }

  async update(id: string, data: UpdateFinancialCategoryDTO, transaction?: any): Promise<FinancialCategory> {
    const db = transaction || this.connection();
    return db.one(
      `UPDATE categorias_financeiras
       SET nome = COALESCE($2, nome),
           descricao = COALESCE($3, descricao),
           tipo = COALESCE($4, tipo),
           plano_conta_id = COALESCE($5, plano_conta_id),
           ativo = COALESCE($6, ativo),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [
        id,
        data.nome ?? null,
        data.descricao ?? null,
        data.tipo ?? null,
        data.planoContaId ?? null,
        data.ativo ?? null,
      ],
    );
  }
}
