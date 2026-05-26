import { EstoqueOrigem } from '../enums/estoque-origem.enum';
import { EstoqueTipoMovimento } from '../enums/estoque-tipo-movimento.enum';

export class MovimentoEstoque {
  id: string;
  produtoId: string;
  depositoId: string;
  enderecoId?: string;
  loteId?: string;
  tipo: EstoqueTipoMovimento;
  origem: EstoqueOrigem;
  origemId?: string;
  quantidade: number;
  custoUnitario: number;
  valorTotal: number;
  observacao?: string;
  usuarioId?: string;
  createdAt: Date;

  constructor(partial?: Partial<MovimentoEstoque>) {
    Object.assign(this, partial);
  }
}
