import { EstoqueOrigem } from '../enums/estoque-origem.enum';
import { StatusReservaEstoque } from '../enums/status-reserva-estoque.enum';

export class ReservaEstoque {
  id: string;
  produtoId: string;
  depositoId: string;
  origem: EstoqueOrigem;
  origemId: string;
  quantidade: number;
  status: StatusReservaEstoque;
  createdAt: Date;

  constructor(partial?: Partial<ReservaEstoque>) {
    Object.assign(this, partial);
  }
}
