import { Inject } from "@nestjs/common";
import { IPersonRepository } from "@person/shared/domain/repository/person-interface.repository";

export class PersonRepository implements IPersonRepository {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly connection: any
  ) { }

  async create(data: any, transaction?: any): Promise<any> {
    const db = transaction || this.connection();
    return db.one(`
      insert
        into
        pessoa (
        nome,
        email,
        tipo,
        colaborador,
        observacao)
      values ($1,$2,$3,$4,$5)
      returning *`,
      [
        data.nome,
        data.email,
        data.tipo.toUpperCase(),
        1,
        data.observacao
      ]);
  }
}