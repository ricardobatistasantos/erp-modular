import { Inject } from '@nestjs/common';
import { IJobPositionRepository } from '../../domain/repository/job-position.interface.repository';

export class JobPositionRepository implements IJobPositionRepository {

  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly connection: any
  ) {}

  async create(data: any, transaction?: any): Promise<any> {
    const db = transaction || this.connection();
    return db.one(
      `INSERT INTO cargo (nome, salario) VALUES ($1, $2) RETURNING *`,
      [data.nome, data.salario]
    );
  }

  async update(id: string, data: any, transaction?: any): Promise<any> {
    const db = transaction || this.connection();
    return db.one(
      `UPDATE cargo
       SET nome = COALESCE($2, nome),
           salario = COALESCE($3, salario)
       WHERE id = $1
       RETURNING *`,
      [id, data.nome ?? null, data.salario ?? null]
    );
  }
}
