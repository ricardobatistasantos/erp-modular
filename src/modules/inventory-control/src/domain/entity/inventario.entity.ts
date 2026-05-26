export class Inventario {
  id: string;
  depositoId: string;
  status: string;
  iniciadoEm: Date;
  finalizadoEm?: Date;
  createdAt: Date;

  constructor(partial?: Partial<Inventario>) {
    Object.assign(this, partial);
  }
}
