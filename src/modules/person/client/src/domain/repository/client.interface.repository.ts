import { Client } from "../entity/client.entity";

export interface IClientRepository {
  create(data: any, transaction?: any): Promise<Client>;
  findById(id: string): Promise<any | null>;
  findAll(page: number, limit: number): Promise<{ data: any[]; total: number }>;
  update(id: string, data: any, transaction?: any): Promise<any>;
  delete(id: string): Promise<void>;
}