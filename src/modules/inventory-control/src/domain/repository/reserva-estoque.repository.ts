import { ReservaEstoque } from '../entity';
import { EstoqueOrigem, StatusReservaEstoque } from '../enums';

export interface IReservaEstoqueRepository {
  create(reserva: ReservaEstoque, transaction?: any): Promise<ReservaEstoque>;
  findByOrigem(origem: EstoqueOrigem, origemId: string, transaction?: any): Promise<ReservaEstoque[]>;
  updateStatus(id: string, status: StatusReservaEstoque, transaction?: any): Promise<ReservaEstoque>;
}
