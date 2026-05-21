export class FinancialSettlement {
  id: string;
  tipoConta: 'RECEBER' | 'PAGAR';
  contaId: string;
  valor: number;
  dataPagamento: Date;
  formaPagamento: string;
  contaBancariaId?: string;
  caixaId?: string;
  lancamentoFinanceiroId: string;
  observacao?: string;
  createdAt: Date;
  updatedAt?: Date;
}
