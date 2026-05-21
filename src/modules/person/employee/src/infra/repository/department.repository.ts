import { Inject } from '@nestjs/common';
import { IDepartmentRepository } from '../../domain/repository/department.interface.repository';

export class DepartmentRepository implements IDepartmentRepository {

  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly connection: any
  ) {}

  async create(data: any, transaction?: any): Promise<any> {
    const db = transaction || this.connection();
    return db.one(
      `INSERT INTO departamento (nome) VALUES ($1) RETURNING *`,
      [data.nome]
    );
  }

  async update(id: string, data: any, transaction?: any): Promise<any> {
    const db = transaction || this.connection();
    return db.one(
      `UPDATE departamento
       SET nome = COALESCE($2, nome)
       WHERE id = $1
       RETURNING *`,
      [id, data.nome]
    );
  }
}
