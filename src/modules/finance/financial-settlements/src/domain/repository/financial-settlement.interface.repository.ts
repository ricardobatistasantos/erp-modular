import { FinancialSettlement } from '../entity/financial-settlement.entity';

export interface IFinancialSettlementRepository {
  create(data: any, transaction?: any): Promise<FinancialSettlement>;
  findById(id: string): Promise<FinancialSettlement | null>;
  findByParcelaId(parcelaId: string): Promise<FinancialSettlement[]>;
  existsByParcelaId(parcelaId: string): Promise<boolean>;
}
