import { FinancialEntry } from '../entity/financial-entry.entity';

export interface IFinancialEntryRepository {
  create(data: any, transaction?: any): Promise<FinancialEntry>;
  findById(id: string): Promise<FinancialEntry | null>;
  findAll(page: number, limit: number): Promise<{ data: FinancialEntry[]; total: number }>;
}
