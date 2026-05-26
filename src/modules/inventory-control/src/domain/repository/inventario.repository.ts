import { Inventario, InventarioItem } from '../entity';

export interface IInventarioRepository {
  create(inventario: Inventario): Promise<Inventario>;
  findById(id: string): Promise<Inventario | null>;
  finalize(id: string): Promise<Inventario>;
  update(id: string, data: Partial<Inventario>): Promise<Inventario>;
  createItem(item: InventarioItem): Promise<InventarioItem>;
  findItensByInventarioId(inventarioId: string): Promise<InventarioItem[]>;
  updateItem(item: InventarioItem): Promise<InventarioItem>;
}
