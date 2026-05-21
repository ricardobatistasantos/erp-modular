import { PaymentMethod } from '../entity/payment-method.entity';

export interface IPaymentMethodRepository {
  create(data: any, transaction?: any): Promise<PaymentMethod>;
  findById(id: string): Promise<PaymentMethod | null>;
  findAll(page: number, limit: number): Promise<{ data: PaymentMethod[]; total: number }>;
  update(id: string, data: any, transaction?: any): Promise<PaymentMethod>;
}
