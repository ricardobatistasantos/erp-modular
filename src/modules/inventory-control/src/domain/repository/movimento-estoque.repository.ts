import { MovimentoEstoque } from '../entity';
import { EstoqueOrigem } from '../enums';

export interface IMovimentoEstoqueRepository {
  create(movimento: MovimentoEstoque): Promise<MovimentoEstoque>;
  findByProdutoId(produtoId: string): Promise<MovimentoEstoque[]>;
  findByOrigem(origem: EstoqueOrigem, origemId: string): Promise<MovimentoEstoque[]>;
}
