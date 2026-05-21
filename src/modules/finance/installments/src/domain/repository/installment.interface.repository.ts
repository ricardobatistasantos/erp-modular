import { Installment } from '../entity/installment.entity';

export interface IInstallmentRepository {
  create(data: any, transaction?: any): Promise<Installment>;
  findById(id: string): Promise<Installment | null>;
  findByOrigemId(origemId: string): Promise<Installment[]>;
}
