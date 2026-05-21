import { ChartOfAccounts } from '../entity/chart-of-accounts.entity';

export interface IChartOfAccountsRepository {
  create(data: any, transaction?: any): Promise<ChartOfAccounts>;
  findById(id: string): Promise<ChartOfAccounts | null>;
  findAll(page: number, limit: number): Promise<{ data: ChartOfAccounts[]; total: number }>;
  update(id: string, data: any, transaction?: any): Promise<ChartOfAccounts>;
  findByCodigo(codigo: string): Promise<ChartOfAccounts | null>;
}
