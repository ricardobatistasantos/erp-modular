import { Inject } from '@nestjs/common';
import { ISubCategoryRepository } from '../../domain/repository/sub-category.interface.repository';
import { SubCategory } from '../../domain/entity/sub-category.entity';
import { CreateSubCategoryDTO } from '../../application/dto/create-sub-category.dto';
import { UpdateSubCategoryDTO } from '../../application/dto/update-sub-category.dto';

export class SubCategoryRepository implements ISubCategoryRepository {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly connection: any,
  ) {}

  async create(data: CreateSubCategoryDTO, transaction?: any): Promise<SubCategory> {
    const db = transaction || this.connection();
    return db.one(
      `INSERT INTO produto_sub_categoria (id, produto_categoria_id, nome, descricao)
       VALUES (gen_random_uuid(), $1, $2, $3) RETURNING *`,
      [data.produtoCategoriaId, data.nome, data.descricao ?? null],
    );
  }

  async findById(id: string): Promise<SubCategory | null> {
    const db = this.connection();
    return db.oneOrNone(
      `SELECT * FROM produto_sub_categoria WHERE id = $1`,
      [id],
    );
  }

  async findAll(page: number, limit: number): Promise<{ data: SubCategory[]; total: number }> {
    const db = this.connection();
    const offset = (page - 1) * limit;

    const data = await db.any(
      `SELECT * FROM produto_sub_categoria ORDER BY nome ASC LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    const countResult = await db.one(
      `SELECT COUNT(*) as total FROM produto_sub_categoria`,
    );

    return { data, total: parseInt(countResult.total, 10) };
  }

  async update(id: string, data: UpdateSubCategoryDTO, transaction?: any): Promise<SubCategory> {
    const db = transaction || this.connection();
    return db.one(
      `UPDATE produto_sub_categoria
       SET produto_categoria_id = COALESCE($2, produto_categoria_id),
           nome = COALESCE($3, nome),
           descricao = COALESCE($4, descricao)
       WHERE id = $1
       RETURNING *`,
      [
        id,
        data.produtoCategoriaId ?? null,
        data.nome ?? null,
        data.descricao ?? null,
      ],
    );
  }
}
