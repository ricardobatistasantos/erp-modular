export class SaldoEstoque {
  id: string;
  produtoId: string;
  depositoId: string;
  enderecoId?: string;
  loteId?: string;
  saldoQuantidade: number;
  reservado: number;
  custoMedio: number;
  updatedAt: Date;

  /** Computed: saldoQuantidade - reservado */
  get disponivel(): number {
    return (this.saldoQuantidade ?? 0) - (this.reservado ?? 0);
  }

  constructor(partial?: Partial<SaldoEstoque>) {
    Object.assign(this, partial);
  }
}
