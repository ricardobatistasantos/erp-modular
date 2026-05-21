export class UpdateAccountReceivableDTO {
  numeroDocumento?: string;
  descricao?: string;
  categoriaFinanceiraId?: string;
  centroCustoId?: string;
  contaBancariaId?: string;
  dataEmissao?: Date;
  dataVencimento?: Date;
  valor?: number;
  formaPagamento?: string;
}
