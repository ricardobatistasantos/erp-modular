import { Inject, Injectable } from '@nestjs/common';
import { IMovimentoEstoqueRepository } from '../../domain/repository/movimento-estoque.repository';
import { MovimentoEstoque } from '../../domain/entity/movimento-estoque.entity';
import { EstoqueOrigem } from '../../domain/enums/estoque-origem.enum';

@Injectable()
export class MovimentoEstoqueRepository implements IMovimentoEstoqueRepository {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly connection: any,
  ) {}

  async create(movimento: MovimentoEstoque): Promise<MovimentoEstoque> {
    const db = this.connection();
    const row = await db.one(
      `INSERT INTO movimentos_estoque (id, produto_id, deposito_id, endereco_id, lote_id, tipo, origem, origem_id, quantidade, custo_unitario, valor_total, observacao, usuario_id, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
       RETURNING *`,
      [
        movimento.produtoId,
        movimento.depositoId,
        movimento.enderecoId ?? null,
        movimento.loteId ?? null,
        movimento.tipo,
        movimento.origem,
        movimento.origemId ?? null,
        movimento.quantidade,
        movimento.custoUnitario,
        movimento.valorTotal,
        movimento.observacao ?? null,
        movimento.usuarioId ?? null,
      ],
    );
    return this.toEntity(row);
  }

  async findByProdutoId(produtoId: string): Promise<MovimentoEstoque[]> {
    const db = this.connection();
    const rows = await db.any(
      `SELECT * FROM movimentos_estoque WHERE produto_id = $1 ORDER BY created_at DESC`,
      [produtoId],
    );
    return rows.map((row) => this.toEntity(row));
  }

  async findByOrigem(origem: EstoqueOrigem, origemId: string): Promise<MovimentoEstoque[]> {
    const db = this.connection();
    const rows = await db.any(
      `SELECT * FROM movimentos_estoque WHERE origem = $1 AND origem_id = $2 ORDER BY created_at DESC`,
      [origem, origemId],
    );
    return rows.map((row) => this.toEntity(row));
  }

  private toEntity(row: any): MovimentoEstoque {
    return new MovimentoEstoque({
      id: row.id,
      produtoId: row.produto_id,
      depositoId: row.deposito_id,
      enderecoId: row.endereco_id,
      loteId: row.lote_id,
      tipo: row.tipo,
      origem: row.origem,
      origemId: row.origem_id,
      quantidade: parseFloat(row.quantidade),
      custoUnitario: parseFloat(row.custo_unitario),
      valorTotal: parseFloat(row.valor_total),
      observacao: row.observacao,
      usuarioId: row.usuario_id,
      createdAt: row.created_at,
    });
  }
}
