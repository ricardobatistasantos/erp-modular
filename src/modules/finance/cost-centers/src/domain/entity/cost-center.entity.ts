export class CostCenter {
  id: string;
  codigo: string;
  nome: string;
  descricao?: string;
  centroPaiId?: string;
  ativo: boolean;
  createdAt: Date;
  updatedAt?: Date;
}
