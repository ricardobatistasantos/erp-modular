import { Inject } from '@nestjs/common';
import { IBrandRepository } from '../../domain/repository/brand.interface.repository';
import { Brand } from '../../domain/entity/brand.entity';
import { CreateBrandDTO } from '../../application/dto/create-brand.dto';
import { UpdateBrandDTO } from '../../application/dto/update-brand.dto';

export class BrandRepository implements IBrandRepository {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly connection: any,
  ) {}

  async create(data: CreateBrandDTO, transaction?: any): Promise<Brand> {
    const db = transaction || this.connection();
    return db.one(
      `INSERT INTO produto_marca (id, nome, descricao)
       VALUES (gen_random_uuid(), $1, $2) RETURNING *`,
      [data.nome, data.descricao ?? null],
    );
  }

  async findById(id: string): Promise<Brand | null> {
    const db = this.connection();
    return db.oneOrNone(
      `SELECT * FROM produto_marca WHERE id = $1`,
      [id],
    );
  }

  async findAll(page: number, limit: number): Promise<{ data: Brand[]; total: number }> {
    const db = this.connection();
    const offset = (page - 1) * limit;

    const data = await db.any(
      `SELECT * FROM produto_marca ORDER BY nome ASC LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    const countResult = await db.one(
      `SELECT COUNT(*) as total FROM produto_marca`,
    );

    return { data, total: parseInt(countResult.total, 10) };
  }

  async update(id: string, data: UpdateBrandDTO, transaction?: any): Promise<Brand> {
    const db = transaction || this.connection();
    return db.one(
      `UPDATE produto_marca
       SET nome = COALESCE($2, nome),
           descricao = COALESCE($3, descricao)
       WHERE id = $1
       RETURNING *`,
      [id, data.nome ?? null, data.descricao ?? null],
    );
  }
}
