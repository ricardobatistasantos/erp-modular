import { StatusTransferenciaEstoque } from '../enums/status-transferencia-estoque.enum';

export class TransferenciaEstoque {
  id: string;
  depositoOrigemId: string;
  depositoDestinoId: string;
  status: StatusTransferenciaEstoque;
  observacao?: string;
  createdAt: Date;

  constructor(partial?: Partial<TransferenciaEstoque>) {
    Object.assign(this, partial);
  }
}
