import { Inject } from "@nestjs/common";
import { IPersonRepository } from "@person/shared/domain/repository/person-interface.repository";

export class PersonRepository implements IPersonRepository {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly connection: any
  ) { }

  async create(data: any, transaction?: any): Promise<any> {
    let colaborador = data.employee || 0;
    let cliente = data.client || 0;
    const db = transaction || this.connection();
    return db.one(`
      insert
        into
        pessoa (
        nome,
        email,
        tipo,
        colaborador,
        cliente,
        observacao)
      values ($1,$2,$3,$4,$5,$6)
      returning *`,
      [
        data.nome,
        data.email,
        data.tipo,
        colaborador,
        cliente,
        data.observacao
      ]);
  }

  async update(id: string, data: any, transaction?: any): Promise<any> {
    const db = transaction || this.connection();
    return db.one(`
      UPDATE pessoa
      SET nome = COALESCE($2, nome),
          email = COALESCE($3, email),
          observacao = COALESCE($4, observacao)
      WHERE id = $1
      RETURNING *`,
      [
        id,
        data.nome ?? null,
        data.email ?? null,
        data.observacao ?? null
      ]);
  }
}