import { Inject } from "@nestjs/common";
import { IAddressRepository } from "@person/shared/domain/repository/person-address-interface.repository";

export class AddressRepository implements IAddressRepository {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly connection: any
  ) { }
  async create(data: any, transaction?: any): Promise<any> {
    const db = transaction || this.connection();
    return db.one(`
      insert
        into
        pessoa_endereco (
        pessoa_id,
        tipo_endereco,
        logradouro,
        numero,
        bairro,
        cidade,
        uf,
        cep
        )
      values ($1, $2, $3, $4, $5, $6, $7, $8)
      returning *`,
      [
        data.pessoaId,
        data.tipoEndereco,
        data.logradouro,
        data.numero,
        data.bairro,
        data.cidade,
        data.uf,
        data.cep.replace(/\D/g, '')
      ]);
  }

  async deleteByPessoaId(pessoaId: string, transaction?: any): Promise<void> {
    const db = transaction || this.connection();
    await db.none(`DELETE FROM pessoa_endereco WHERE pessoa_id = $1`, [pessoaId]);
  }
}