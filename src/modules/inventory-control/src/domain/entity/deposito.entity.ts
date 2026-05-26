export class Deposito {
  id: string;
  empresaId: string;
  nome: string;
  ativo: boolean;
  createdAt: Date;

  constructor(partial?: Partial<Deposito>) {
    Object.assign(this, partial);
  }
}
