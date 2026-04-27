import { Inject } from "@nestjs/common";
import { IPersonJuridicaRepository } from "@person/shared/domain/repository/person-juridica-interface.repository";

export class PersonJuridicaRepository implements IPersonJuridicaRepository {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly connection: any
  ) { }
  async create(data: any, transaction?: any): Promise<any> {
    const db = transaction || this.connection();
    return db.one(`
      insert
        into
        pessoa_juridica(
        pessoa_id,
        cnpj)
      values ($1,$2)
      returning *`,
      [
        data.pessoaId,
        data.cnpj.replace(/\D/g, '')
      ]);
  }
}