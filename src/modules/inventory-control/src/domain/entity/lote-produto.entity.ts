export class LoteProduto {
  id: string;
  produtoId: string;
  lote: string;
  fabricacao: Date;
  validade: Date;
  createdAt: Date;

  constructor(partial?: Partial<LoteProduto>) {
    Object.assign(this, partial);
  }
}
