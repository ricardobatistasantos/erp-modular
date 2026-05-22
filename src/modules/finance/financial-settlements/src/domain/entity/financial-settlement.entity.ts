export class FinancialSettlement {
  id: string;
  tipoConta: 'RECEBER' | 'PAGAR';
  parcelaId: string;
  valor: number;
  juros: number;
  multa: number;
  desconto: number;
  valorLiquido: number;
  dataPagamento: Date;
  formaPagamento: string;
  contaBancariaId?: string;
  caixaId?: string;
  lancamentoFinanceiroId: string;
  observacao?: string;
  createdAt: Date;
  updatedAt?: Date;
}
