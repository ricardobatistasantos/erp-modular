export class InventarioItem {
  id: string;
  inventarioId: string;
  produtoId: string;
  saldoSistema: number;
  saldoFisico: number;

  /** Computed: saldoFisico - saldoSistema */
  get divergencia(): number {
    return (this.saldoFisico ?? 0) - (this.saldoSistema ?? 0);
  }

  constructor(partial?: Partial<InventarioItem>) {
    Object.assign(this, partial);
  }
}
