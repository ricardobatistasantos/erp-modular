import { Client } from "../entity/client.entity";

export interface IClientRepository {
  create(data: any, transaction?: any): Promise<Client>;
}