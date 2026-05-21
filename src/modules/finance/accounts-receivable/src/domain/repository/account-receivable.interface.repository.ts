import { AccountReceivable } from '../entity/account-receivable.entity';

export interface IAccountReceivableRepository {
  create(data: any, transaction?: any): Promise<AccountReceivable>;
  findById(id: string): Promise<AccountReceivable | null>;
  findAll(page: number, limit: number): Promise<{ data: AccountReceivable[]; total: number }>;
  update(id: string, data: any, transaction?: any): Promise<AccountReceivable>;
  updateValorRecebido(id: string, valorRecebido: number, status: string, transaction?: any): Promise<AccountReceivable>;
}
