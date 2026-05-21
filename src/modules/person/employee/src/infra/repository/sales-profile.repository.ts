import { Inject } from '@nestjs/common';
import { ISalesProfileRepository } from '../../domain/repository/sales-profile.interface.repository';

export class SalesProfileRepository implements ISalesProfileRepository {

  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly connection: any
  ) {}

  async create(data: any, transaction?: any): Promise<any> {
    const db = transaction || this.connection();
    return db.one(
      `INSERT INTO vendedor (colaborador_id, comissao, meta_venda)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [data.colaboradorId, data.comissao, data.metaVenda]
    );
  }

  async update(colaboradorId: string, data: any, transaction?: any): Promise<any> {
    const db = transaction || this.connection();
    return db.one(
      `UPDATE vendedor
       SET comissao = COALESCE($2, comissao),
           meta_venda = COALESCE($3, meta_venda)
       WHERE colaborador_id = $1
       RETURNING *`,
      [colaboradorId, data.comissao, data.metaVenda]
    );
  }

  async findByColaboradorId(colaboradorId: string, transaction?: any): Promise<any | null> {
    const db = transaction || this.connection();
    return db.oneOrNone(
      `SELECT * FROM vendedor WHERE colaborador_id = $1`,
      [colaboradorId]
    );
  }
}
