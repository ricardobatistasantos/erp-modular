export class AccountPayable {
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
  valorPago: number;
  status: string;
  formaPagamento?: string;
  createdAt: Date;
  updatedAt?: Date;
}
