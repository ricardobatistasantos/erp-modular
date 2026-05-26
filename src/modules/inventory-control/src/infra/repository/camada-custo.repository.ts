import { Inject, Injectable } from '@nestjs/common';
import { ICamadaCustoRepository } from '../../domain/repository/camada-custo.repository';
import { CamadaCusto } from '../../domain/entity/camada-custo.entity';

@Injectable()
export class CamadaCustoRepository implements ICamadaCustoRepository {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly connection: any,
  ) {}

  async create(camada: CamadaCusto, transaction?: any): Promise<CamadaCusto> {
    const db = transaction || this.connection();
    const row = await db.one(
      `INSERT INTO camadas_custo (id, produto_id, movimento_id, quantidade, custo_unitario, saldo_quantidade, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [
        camada.produtoId,
        camada.movimentoId,
        camada.quantidade,
        camada.custoUnitario,
        camada.saldoQuantidade,
      ],
    );
    return this.toEntity(row);
  }

  async findByProdutoId(produtoId: string, transaction?: any): Promise<CamadaCusto[]> {
    const db = transaction || this.connection();
    const rows = await db.any(
      `SELECT * FROM camadas_custo WHERE produto_id = $1 ORDER BY created_at ASC`,
      [produtoId],
    );
    return rows.map((row) => this.toEntity(row));
  }

  private toEntity(row: any): CamadaCusto {
    return new CamadaCusto({
      id: row.id,
      produtoId: row.produto_id,
      movimentoId: row.movimento_id,
      quantidade: parseFloat(row.quantidade),
      custoUnitario: parseFloat(row.custo_unitario),
      saldoQuantidade: parseFloat(row.saldo_quantidade),
      createdAt: row.created_at,
    });
  }
}
