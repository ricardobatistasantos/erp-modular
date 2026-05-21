export class AccountReceivable {
  id: string;
  pessoaId: string;
  numeroDocumento: string;
  descricao: string;
  categoriaFinanceiraId: string;
  centroCustoId?: string;
  contaBancariaId?: string;
  dataEmissao: Date;
  dataVencimento: Date;
  valor: number;
  valorRecebido: number;
  status: string;
  formaPagamento?: string;
  createdAt: Date;
  updatedAt?: Date;
}
