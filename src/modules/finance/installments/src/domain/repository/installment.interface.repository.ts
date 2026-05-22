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
}
