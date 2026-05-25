import { Inject } from '@nestjs/common';
import { IUnitOfMeasureRepository } from '../../domain/repository/unit-of-measure.interface.repository';
import { UnitOfMeasure } from '../../domain/entity/unit-of-measure.entity';
import { CreateUnitOfMeasureDTO } from '../../application/dto/create-unit-of-measure.dto';
import { UpdateUnitOfMeasureDTO } from '../../application/dto/update-unit-of-measure.dto';

export class UnitOfMeasureRepository implements IUnitOfMeasureRepository {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly connection: any,
  ) {}

  async create(data: CreateUnitOfMeasureDTO, transaction?: any): Promise<UnitOfMeasure> {
    const db = transaction || this.connection();
    return db.one(
      `INSERT INTO produto_unidade_medida (id, sigla, pode_fracionar, descricao)
       VALUES (gen_random_uuid(), $1, $2, $3) RETURNING *`,
      [data.sigla, data.podeFracionar, data.descricao ?? null],
    );
  }

  async findById(id: string): Promise<UnitOfMeasure | null> {
    const db = this.connection();
    return db.oneOrNone(
      `SELECT * FROM produto_unidade_medida WHERE id = $1`,
      [id],
    );
  }

  async findAll(page: number, limit: number): Promise<{ data: UnitOfMeasure[]; total: number }> {
    const db = this.connection();
    const offset = (page - 1) * limit;

    const data = await db.any(
      `SELECT * FROM produto_unidade_medida ORDER BY sigla ASC LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    const countResult = await db.one(
      `SELECT COUNT(*) as total FROM produto_unidade_medida`,
    );

    return { data, total: parseInt(countResult.total, 10) };
  }

  async update(id: string, data: UpdateUnitOfMeasureDTO, transaction?: any): Promise<UnitOfMeasure> {
    const db = transaction || this.connection();
    return db.one(
      `UPDATE produto_unidade_medida
       SET sigla = COALESCE($2, sigla),
           pode_fracionar = COALESCE($3, pode_fracionar),
           descricao = COALESCE($4, descricao)
       WHERE id = $1
       RETURNING *`,
      [id, data.sigla ?? null, data.podeFracionar ?? null, data.descricao ?? null],
    );
  }
}
