export class TransferenciaItem {
  id: string;
  transferenciaId: string;
  produtoId: string;
  quantidade: number;

  constructor(partial?: Partial<TransferenciaItem>) {
    Object.assign(this, partial);
  }
}
