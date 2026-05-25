import { Inject } from '@nestjs/common';
import { ICategoryRepository } from '../../domain/repository/category.interface.repository';
import { Category } from '../../domain/entity/category.entity';
import { CreateCategoryDTO } from '../../application/dto/create-category.dto';
import { UpdateCategoryDTO } from '../../application/dto/update-category.dto';

export class CategoryRepository implements ICategoryRepository {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly connection: any,
  ) {}

  async create(data: CreateCategoryDTO, transaction?: any): Promise<Category> {
    const db = transaction || this.connection();
    return db.one(
      `INSERT INTO produto_categoria (id, nome, descricao)
       VALUES (gen_random_uuid(), $1, $2) RETURNING *`,
      [data.nome, data.descricao ?? null],
    );
  }

  async findById(id: string): Promise<Category | null> {
    const db = this.connection();
    return db.oneOrNone(
      `SELECT * FROM produto_categoria WHERE id = $1`,
      [id],
    );
  }

  async findAll(page: number, limit: number): Promise<{ data: Category[]; total: number }> {
    const db = this.connection();
    const offset = (page - 1) * limit;

    const data = await db.any(
      `SELECT * FROM produto_categoria ORDER BY nome ASC LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    const countResult = await db.one(
      `SELECT COUNT(*) as total FROM produto_categoria`,
    );

    return { data, total: parseInt(countResult.total, 10) };
  }

  async update(id: string, data: UpdateCategoryDTO, transaction?: any): Promise<Category> {
    const db = transaction || this.connection();
    return db.one(
      `UPDATE produto_categoria
       SET nome = COALESCE($2, nome),
           descricao = COALESCE($3, descricao)
       WHERE id = $1
       RETURNING *`,
      [id, data.nome ?? null, data.descricao ?? null],
    );
  }
}
