export class FinancialCategory {
  id: string;
  nome: string;
  descricao?: string;
  tipo: string;
  planoContaId?: string;
  ativo: boolean;
  createdAt: Date;
  updatedAt?: Date;
}
