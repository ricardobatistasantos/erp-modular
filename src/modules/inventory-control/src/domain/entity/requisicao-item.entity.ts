export class RequisicaoItem {
  id: string;
  requisicaoId: string;
  produtoId: string;
  quantidade: number;
  quantidadeAtendida: number;

  constructor(partial?: Partial<RequisicaoItem>) {
    Object.assign(this, partial);
  }
}
