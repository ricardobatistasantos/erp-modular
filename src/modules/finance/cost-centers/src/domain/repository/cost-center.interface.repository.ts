import { CostCenter } from '../entity/cost-center.entity';

export interface ICostCenterRepository {
  create(data: any, transaction?: any): Promise<CostCenter>;
  findById(id: string): Promise<CostCenter | null>;
  findAll(page: number, limit: number): Promise<{ data: CostCenter[]; total: number }>;
  update(id: string, data: any, transaction?: any): Promise<CostCenter>;
  findByCodigo(codigo: string): Promise<CostCenter | null>;
}
