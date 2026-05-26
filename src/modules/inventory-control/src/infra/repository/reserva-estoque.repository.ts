import { Inject, Injectable } from '@nestjs/common';
import { IReservaEstoqueRepository } from '../../domain/repository/reserva-estoque.repository';
import { ReservaEstoque } from '../../domain/entity/reserva-estoque.entity';
import { EstoqueOrigem, StatusReservaEstoque } from '../../domain/enums';

@Injectable()
export class ReservaEstoqueRepository implements IReservaEstoqueRepository {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly connection: any,
  ) {}

  async create(reserva: ReservaEstoque): Promise<ReservaEstoque> {
    const db = this.connection();
    const row = await db.one(
      `INSERT INTO reservas_estoque (id, produto_id, deposito_id, origem, origem_id, quantidade, status, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [
        reserva.produtoId,
        reserva.depositoId,
        reserva.origem,
        reserva.origemId,
        reserva.quantidade,
        reserva.status,
      ],
    );
    return this.toEntity(row);
  }

  async findByOrigem(origem: EstoqueOrigem, origemId: string): Promise<ReservaEstoque[]> {
    const db = this.connection();
    const rows = await db.any(
      `SELECT * FROM reservas_estoque WHERE origem = $1 AND origem_id = $2 ORDER BY created_at DESC`,
      [origem, origemId],
    );
    return rows.map((row) => this.toEntity(row));
  }

  async updateStatus(id: string, status: StatusReservaEstoque): Promise<ReservaEstoque> {
    const db = this.connection();
    const row = await db.one(
      `UPDATE reservas_estoque SET status = $2 WHERE id = $1 RETURNING *`,
      [id, status],
    );
    return this.toEntity(row);
  }

  private toEntity(row: any): ReservaEstoque {
    return new ReservaEstoque({
      id: row.id,
      produtoId: row.produto_id,
      depositoId: row.deposito_id,
      origem: row.origem,
      origemId: row.origem_id,
      quantidade: parseFloat(row.quantidade),
      status: row.status,
      createdAt: row.created_at,
    });
  }
}
