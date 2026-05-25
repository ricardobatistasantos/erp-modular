import { SubCategory } from '../entity/sub-category.entity';

export interface ISubCategoryRepository {
  create(data: any, transaction?: any): Promise<SubCategory>;
  findById(id: string): Promise<SubCategory | null>;
  findAll(page: number, limit: number): Promise<{ data: SubCategory[]; total: number }>;
  update(id: string, data: any, transaction?: any): Promise<SubCategory>;
}
