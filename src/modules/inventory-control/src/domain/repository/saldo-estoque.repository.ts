import { SaldoEstoque } from '../entity';

export interface ISaldoEstoqueRepository {
  upsert(saldo: SaldoEstoque, transaction?: any): Promise<SaldoEstoque>;
  findByProdutoId(produtoId: string, transaction?: any): Promise<SaldoEstoque[]>;
  findByDepositoId(depositoId: string, transaction?: any): Promise<SaldoEstoque[]>;
  findByProdutoAndDeposito(produtoId: string, depositoId: string, transaction?: any): Promise<SaldoEstoque | null>;
}
