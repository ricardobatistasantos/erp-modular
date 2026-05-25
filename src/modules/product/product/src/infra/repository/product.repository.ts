import { Inject } from '@nestjs/common';
import { IProductRepository } from '../../domain/repository/product.interface.repository';
import { Product } from '../../domain/entity/product.entity';
import { CreateProductDTO } from '../../application/dto/create-product.dto';
import { UpdateProductDTO } from '../../application/dto/update-product.dto';

export class ProductRepository implements IProductRepository {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly connection: any,
  ) {}

  async create(data: CreateProductDTO, transaction?: any): Promise<Product> {
    const db = transaction || this.connection();
    return db.one(
      `INSERT INTO produto (id, produto_sub_categoria_id, produto_unidade_medida_id, produto_marca_id, nome, gtin, codigo_interno, valor_compra, valor_venda, quantidade_estoque, cadastro, descricao)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        data.produtoSubCategoriaId,
        data.produtoUnidadeMedidaId,
        data.produtoMarcaId,
        data.nome,
        data.gtin ?? null,
        data.codigoInterno ?? null,
        data.valorCompra,
        data.valorVenda,
        data.quantidadeEstoque,
        data.cadastro,
        data.descricao ?? null,
      ],
    );
  }

  async findById(id: string): Promise<Product | null> {
    const db = this.connection();
    return db.oneOrNone(
      `SELECT * FROM produto WHERE id = $1`,
      [id],
    );
  }

  async findAll(page: number, limit: number): Promise<{ data: Product[]; total: number }> {
    const db = this.connection();
    const offset = (page - 1) * limit;

    const data = await db.any(
      `SELECT * FROM produto ORDER BY nome ASC LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    const countResult = await db.one(
      `SELECT COUNT(*) as total FROM produto`,
    );

    return { data, total: parseInt(countResult.total, 10) };
  }

  async update(id: string, data: UpdateProductDTO, transaction?: any): Promise<Product> {
    const db = transaction || this.connection();
    return db.one(
      `UPDATE produto
       SET produto_sub_categoria_id = COALESCE($2, produto_sub_categoria_id),
           produto_unidade_medida_id = COALESCE($3, produto_unidade_medida_id),
           produto_marca_id = COALESCE($4, produto_marca_id),
           nome = COALESCE($5, nome),
           gtin = COALESCE($6, gtin),
           codigo_interno = COALESCE($7, codigo_interno),
           valor_compra = COALESCE($8, valor_compra),
           valor_venda = COALESCE($9, valor_venda),
           quantidade_estoque = COALESCE($10, quantidade_estoque),
           cadastro = COALESCE($11, cadastro),
           descricao = COALESCE($12, descricao)
       WHERE id = $1
       RETURNING *`,
      [
        id,
        data.produtoSubCategoriaId ?? null,
        data.produtoUnidadeMedidaId ?? null,
        data.produtoMarcaId ?? null,
        data.nome ?? null,
        data.gtin ?? null,
        data.codigoInterno ?? null,
        data.valorCompra ?? null,
        data.valorVenda ?? null,
        data.quantidadeEstoque ?? null,
        data.cadastro ?? null,
        data.descricao ?? null,
      ],
    );
  }
}
