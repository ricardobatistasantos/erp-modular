import { AccountPayable } from '../entity/account-payable.entity';

export interface IAccountPayableRepository {
  create(data: any, transaction?: any): Promise<AccountPayable>;
  findById(id: string): Promise<AccountPayable | null>;
  findAll(page: number, limit: number): Promise<{ data: AccountPayable[]; total: number }>;
  update(id: string, data: any, transaction?: any): Promise<AccountPayable>;
  updateValorPago(id: string, valorPago: number, status: string, transaction?: any): Promise<AccountPayable>;
}
