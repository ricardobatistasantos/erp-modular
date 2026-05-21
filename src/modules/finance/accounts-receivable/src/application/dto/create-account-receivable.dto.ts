export class CreateAccountReceivableDTO {
  pessoaId: string;
  numeroDocumento: string;
  descricao: string;
  categoriaFinanceiraId: string;
  dataEmissao: Date;
  dataVencimento: Date;
  valor: number;
  centroCustoId?: string;
  contaBancariaId?: string;
  formaPagamento?: string;
}
