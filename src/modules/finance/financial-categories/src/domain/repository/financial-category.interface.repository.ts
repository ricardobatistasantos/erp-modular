import { FinancialCategory } from '../entity/financial-category.entity';

export interface IFinancialCategoryRepository {
  create(data: any, transaction?: any): Promise<FinancialCategory>;
  findById(id: string): Promise<FinancialCategory | null>;
  findAll(page: number, limit: number): Promise<{ data: FinancialCategory[]; total: number }>;
  update(id: string, data: any, transaction?: any): Promise<FinancialCategory>;
}
