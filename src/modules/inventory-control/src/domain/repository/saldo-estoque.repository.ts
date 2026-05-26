import { SaldoEstoque } from '../entity';

export interface ISaldoEstoqueRepository {
  upsert(saldo: SaldoEstoque): Promise<SaldoEstoque>;
  findByProdutoId(produtoId: string): Promise<SaldoEstoque[]>;
  findByDepositoId(depositoId: string): Promise<SaldoEstoque[]>;
  findByProdutoAndDeposito(produtoId: string, depositoId: string): Promise<SaldoEstoque | null>;
}
