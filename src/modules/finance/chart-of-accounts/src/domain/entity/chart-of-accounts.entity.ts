export class ChartOfAccounts {
  id: string;
  codigo: string;
  nome: string;
  tipo: 'SINTETICA' | 'ANALITICA';
  natureza: 'RECEITA' | 'DESPESA' | 'ATIVO' | 'PASSIVO' | 'PATRIMONIO';
  contaPaiId?: string;
  aceitaLancamento: boolean;
  ativo: boolean;
  createdAt: Date;
  updatedAt?: Date;
}
