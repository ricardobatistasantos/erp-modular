export class CreateFinancialSettlementDTO {
  tipoConta: 'RECEBER' | 'PAGAR';
  contaId: string;
  valor: number;
  dataPagamento: Date;
  formaPagamento: string;
  contaBancariaId?: string;
  caixaId?: string;
  observacao?: string;
}
