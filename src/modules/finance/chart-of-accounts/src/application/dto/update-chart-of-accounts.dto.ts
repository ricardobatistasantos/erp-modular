export class UpdateChartOfAccountsDTO {
  codigo?: string;
  nome?: string;
  tipo?: 'SINTETICA' | 'ANALITICA';
  natureza?: 'RECEITA' | 'DESPESA' | 'ATIVO' | 'PASSIVO' | 'PATRIMONIO';
  contaPaiId?: string;
  aceitaLancamento?: boolean;
  ativo?: boolean;
}
