import { CamadaCusto } from '../entity';

export interface ICamadaCustoRepository {
  create(camada: CamadaCusto, transaction?: any): Promise<CamadaCusto>;
  findByProdutoId(produtoId: string, transaction?: any): Promise<CamadaCusto[]>;
}
