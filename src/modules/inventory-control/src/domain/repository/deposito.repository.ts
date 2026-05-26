import { Deposito } from '../entity';

export interface IDepositoRepository {
  create(deposito: Deposito): Promise<Deposito>;
  findById(id: string): Promise<Deposito | null>;
  findAll(empresaId: string): Promise<Deposito[]>;
  update(deposito: Deposito): Promise<Deposito>;
}
