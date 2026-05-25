import { Brand } from '../entity/brand.entity';
import { CreateBrandDTO } from '../../application/dto/create-brand.dto';
import { UpdateBrandDTO } from '../../application/dto/update-brand.dto';

export interface IBrandRepository {
  create(data: CreateBrandDTO, transaction?: any): Promise<Brand>;
  findById(id: string): Promise<Brand | null>;
  findAll(page: number, limit: number): Promise<{ data: Brand[]; total: number }>;
  update(id: string, data: UpdateBrandDTO, transaction?: any): Promise<Brand>;
}
