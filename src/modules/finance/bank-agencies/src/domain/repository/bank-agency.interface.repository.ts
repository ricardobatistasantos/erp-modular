import { BankAgency } from '../entity/bank-agency.entity';
import { CreateBankAgencyDTO } from '../../application/dto/create-bank-agency.dto';
import { UpdateBankAgencyDTO } from '../../application/dto/update-bank-agency.dto';

export interface IBankAgencyRepository {
  create(data: CreateBankAgencyDTO): Promise<BankAgency>;
  findById(id: string): Promise<BankAgency | null>;
  findAll(page: number, limit: number, bancoId?: string): Promise<{ data: BankAgency[]; total: number }>;
  update(id: string, data: UpdateBankAgencyDTO): Promise<BankAgency>;
  delete(id: string): Promise<void>;
  countByBancoId(bancoId: string): Promise<number>;
}
