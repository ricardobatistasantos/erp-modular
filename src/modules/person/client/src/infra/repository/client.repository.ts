// import { Employee } from "../../domain/entity/employee.entity";
import { Inject } from "@nestjs/common";
import { IClientRepository } from "../../domain/repository/client.interface.repository";

export class ClientRepository implements IClientRepository {
  
  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly connection: any
  ) {}
  
  async create(data: any, transaction: any): Promise<any> {
    const db = transaction || this.connection();
    return db.one(
      `insert
        into
        cliente (
          pessoa_id,
          taxa_desconto,
          limit_credito
          )
           values ($1,
            $2,$3) returning *;`,
      [data.pessoaId, data.taxaDesconto, data.limiteCredito]
    );
  }
}