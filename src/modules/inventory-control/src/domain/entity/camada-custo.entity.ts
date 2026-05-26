export class CamadaCusto {
  id: string;
  produtoId: string;
  movimentoId: string;
  quantidade: number;
  custoUnitario: number;
  saldoQuantidade: number;
  createdAt: Date;

  constructor(partial?: Partial<CamadaCusto>) {
    Object.assign(this, partial);
  }
}
