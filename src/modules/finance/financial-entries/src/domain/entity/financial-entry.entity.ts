export class FinancialEntry {
  id: string;
  tipo: 'RECEITA' | 'DESPESA';
  origem: string;
  origemId: string;
  planoContaId: string;
  centroCustoId?: string;
  contaBancariaId?: string;
  caixaId?: string;
  dataLancamento: Date;
  descricao: string;
  valor: number;
  saldoAnterior?: number;
  saldoPosterior?: number;
}
