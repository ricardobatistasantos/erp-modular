import { Inject } from "@nestjs/common";
import { IContactRepository } from "@person/shared/domain/repository/person-contact-interface.repository";

export class ContactRepository implements IContactRepository {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly connection: any
  ) { }
  async create(data: any, transaction?: any): Promise<any> {
    const db = transaction || this.connection();
    return db.one(`
      insert
        into
        pessoa_contato (
        pessoa_id,
        tipo_contato,
        telefone
        )
      values ($1,$2, $3)
      returning *`,
      [
        data.pessoaId,
        data.tipo,
        data.telefone
      ]);
  }
}