import { TransferenciaEstoque, TransferenciaItem } from '../entity';
import { StatusTransferenciaEstoque } from '../enums';

export interface ITransferenciaEstoqueRepository {
  create(transferencia: TransferenciaEstoque, itens: TransferenciaItem[]): Promise<TransferenciaEstoque>;
  findById(id: string): Promise<TransferenciaEstoque | null>;
  updateStatus(id: string, status: StatusTransferenciaEstoque): Promise<TransferenciaEstoque>;
  createItem(item: TransferenciaItem): Promise<TransferenciaItem>;
  findItensByTransferenciaId(transferenciaId: string): Promise<TransferenciaItem[]>;
}
