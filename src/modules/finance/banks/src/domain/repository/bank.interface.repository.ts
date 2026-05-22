import { Bank } from '../entity/bank.entity';
import { CreateBankDTO } from '../../application/dto/create-bank.dto';
import { UpdateBankDTO } from '../../application/dto/update-bank.dto';

export interface IBankRepository {
  create(data: CreateBankDTO): Promise<Bank>;
  findById(id: string): Promise<Bank | null>;
  findAll(page: number, limit: number): Promise<{ data: Bank[]; total: number }>;
  update(id: string, data: UpdateBankDTO): Promise<Bank>;
  delete(id: string): Promise<void>;
}
