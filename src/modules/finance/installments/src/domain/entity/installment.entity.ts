export class Installment {
  id: string;
  origem: 'PAGAR' | 'RECEBER';
  origemId: string;
  numeroParcela: number;
  totalParcelas: number;
  dataVencimento: Date;
  valor: number;
  valorPago: number;
  status: 'PENDENTE' | 'PARCIAL' | 'PAGO' | 'CANCELADO';
  createdAt: Date;
  updatedAt?: Date;
}
