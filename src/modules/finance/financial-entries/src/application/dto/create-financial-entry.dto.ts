export class CreateFinancialEntryDTO {
  tipo: 'RECEITA' | 'DESPESA';
  origem: string;
  origemId: string;
  planoContaId: string;
  dataLancamento: Date;
  descricao: string;
  valor: number;
  centroCustoId?: string;
  contaBancariaId?: string;
  caixaId?: string;
}
