import { TransferenciaEstoque, TransferenciaItem } from '../entity';
import { StatusTransferenciaEstoque } from '../enums';

export interface ITransferenciaEstoqueRepository {
  create(transferencia: TransferenciaEstoque, itens: TransferenciaItem[], transaction?: any): Promise<TransferenciaEstoque>;
  findById(id: string, transaction?: any): Promise<TransferenciaEstoque | null>;
  updateStatus(id: string, status: StatusTransferenciaEstoque, transaction?: any): Promise<TransferenciaEstoque>;
  createItem(item: TransferenciaItem, transaction?: any): Promise<TransferenciaItem>;
  findItensByTransferenciaId(transferenciaId: string, transaction?: any): Promise<TransferenciaItem[]>;
}
