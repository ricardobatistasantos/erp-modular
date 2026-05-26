import { MovimentoEstoque } from '../entity';
import { EstoqueOrigem } from '../enums';

export interface IMovimentoEstoqueRepository {
  create(movimento: MovimentoEstoque, transaction?: any): Promise<MovimentoEstoque>;
  findByProdutoId(produtoId: string, transaction?: any): Promise<MovimentoEstoque[]>;
  findByOrigem(origem: EstoqueOrigem, origemId: string, transaction?: any): Promise<MovimentoEstoque[]>;
}
