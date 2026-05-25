import { Supplier } from '../entity/supplier.entity';

export interface ISupplierRepository {
  create(data: any, transaction?: any): Promise<Supplier>;
  findById(id: string): Promise<any | null>;
  findAll(page: number, limit: number): Promise<{ data: any[]; total: number }>;
  update(id: string, data: any, transaction?: any): Promise<any>;
  delete(id: string): Promise<void>;
}
