export class CautelaFerramenta {
  id: string;
  funcionarioId: string;
  produtoId: string;
  quantidade: number;
  retiradoEm: Date;
  devolvidoEm?: Date;

  constructor(partial?: Partial<CautelaFerramenta>) {
    Object.assign(this, partial);
  }
}
