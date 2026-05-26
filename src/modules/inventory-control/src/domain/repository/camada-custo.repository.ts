import { CamadaCusto } from '../entity';

export interface ICamadaCustoRepository {
  create(camada: CamadaCusto): Promise<CamadaCusto>;
  findByProdutoId(produtoId: string): Promise<CamadaCusto[]>;
}
