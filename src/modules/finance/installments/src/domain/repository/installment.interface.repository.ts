import { Installment } from '../entity/installment.entity';

export interface IInstallmentRepository {
  create(data: any, transaction?: any): Promise<Installment>;
  createMany(data: any[], transaction?: any): Promise<Installment[]>;
  findById(id: string): Promise<Installment | null>;
  findByOrigemId(origemId: string): Promise<Installment[]>;
  updateValorPago(
    id: string,
    valorPago: number,
    status: string,
    transaction?: any,
  ): Promise<Installment>;
  updateStatus(
    id: string,
    status: string,
    transaction?: any,
  ): Promise<Installment>;
  hasSettlements(origemId: string): Promise<boolean>;
  updateValor(id: string, valor: number, transaction?: any): Promise<Installment>;
  cancelMany(ids: string[], transaction?: any): Promise<void>;
  findPendingByOrigemId(origemId: string): Promise<Installment[]>;
  getMaxNumeroParcela(origemId: string): Promise<number>;
  hasSettlementsByParcelaIds(parcelaIds: string[]): Promise<boolean>;
}
