import { Category } from '../entity/category.entity';
import { CreateCategoryDTO } from '../../application/dto/create-category.dto';
import { UpdateCategoryDTO } from '../../application/dto/update-category.dto';

export interface ICategoryRepository {
  create(data: CreateCategoryDTO, transaction?: any): Promise<Category>;
  findById(id: string): Promise<Category | null>;
  findAll(page: number, limit: number): Promise<{ data: Category[]; total: number }>;
  update(id: string, data: UpdateCategoryDTO, transaction?: any): Promise<Category>;
}
