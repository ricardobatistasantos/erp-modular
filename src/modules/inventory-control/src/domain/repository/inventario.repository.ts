import { Inventario, InventarioItem } from '../entity';

export interface IInventarioRepository {
  create(inventario: Inventario, transaction?: any): Promise<Inventario>;
  findById(id: string): Promise<Inventario | null>;
  finalize(id: string, transaction?: any): Promise<Inventario>;
  update(id: string, data: Partial<Inventario>): Promise<Inventario>;
  createItem(item: InventarioItem, transaction?: any): Promise<InventarioItem>;
  findItensByInventarioId(inventarioId: string): Promise<InventarioItem[]>;
  updateItem(item: InventarioItem): Promise<InventarioItem>;
}
