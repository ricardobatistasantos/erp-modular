import { BankAccount } from '../entity/bank-account.entity';
import { CreateBankAccountDTO } from '../../application/dto/create-bank-account.dto';
import { UpdateBankAccountDTO } from '../../application/dto/update-bank-account.dto';

export interface IBankAccountRepository {
  create(data: CreateBankAccountDTO): Promise<BankAccount>;
  findById(id: string): Promise<BankAccount | null>;
  findAll(page: number, limit: number, bancoAgenciaId?: string): Promise<{ data: BankAccount[]; total: number }>;
  update(id: string, data: UpdateBankAccountDTO): Promise<BankAccount>;
  delete(id: string): Promise<void>;
  countByAgenciaId(agenciaId: string): Promise<number>;
}
