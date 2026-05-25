import { Product } from '../entity/product.entity';
import { CreateProductDTO } from '../../application/dto/create-product.dto';
import { UpdateProductDTO } from '../../application/dto/update-product.dto';

export interface IProductRepository {
  create(data: CreateProductDTO, transaction?: any): Promise<Product>;
  findById(id: string): Promise<Product | null>;
  findAll(page: number, limit: number): Promise<{ data: Product[]; total: number }>;
  update(id: string, data: UpdateProductDTO, transaction?: any): Promise<Product>;
}
