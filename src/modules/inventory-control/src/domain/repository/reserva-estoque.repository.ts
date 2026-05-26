import { ReservaEstoque } from '../entity';
import { EstoqueOrigem, StatusReservaEstoque } from '../enums';

export interface IReservaEstoqueRepository {
  create(reserva: ReservaEstoque): Promise<ReservaEstoque>;
  findByOrigem(origem: EstoqueOrigem, origemId: string): Promise<ReservaEstoque[]>;
  updateStatus(id: string, status: StatusReservaEstoque): Promise<ReservaEstoque>;
}
