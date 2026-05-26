export class EnderecoEstoque {
  id: string;
  depositoId: string;
  codigo: string;
  descricao: string;
  createdAt: Date;

  constructor(partial?: Partial<EnderecoEstoque>) {
    Object.assign(this, partial);
  }
}
