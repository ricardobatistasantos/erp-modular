import { Inject } from "@nestjs/common";
import { IPersonFisicaRepository } from "@person/shared/domain/repository/person-fisica-interface.repository";

export class PersonFisicaRepository implements IPersonFisicaRepository {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly connection: any
  ) { }
  async create(data: any, transaction?: any): Promise<any> {
    const db = transaction || this.connection();
    return db.one(`
      insert
        into
        pessoa_fisica (
        pessoa_id,
        cpf)
      values ($1,$2)
      returning *`,
      [
        data.pessoaId,
        data.cpf.replace(/\D/g, '')
      ]);
  }

  async update(pessoaId: string, data: any, transaction?: any): Promise<any> {
    const db = transaction || this.connection();
    return db.one(`
      UPDATE pessoa_fisica
      SET cpf = COALESCE($2, cpf)
      WHERE pessoa_id = $1
      RETURNING *`,
      [
        pessoaId,
        data.cpf ? data.cpf.replace(/\D/g, '') : null
      ]);
  }
}