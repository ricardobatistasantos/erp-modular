import { Inject } from '@nestjs/common';
import { IBankAccountRepository } from '../../domain/repository/bank-account.interface.repository';
import { BankAccount } from '../../domain/entity/bank-account.entity';
import { CreateBankAccountDTO } from '../../application/dto/create-bank-account.dto';
import { UpdateBankAccountDTO } from '../../application/dto/update-bank-account.dto';

export class BankAccountRepository implements IBankAccountRepository {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly connection: any,
  ) {}

  async create(data: CreateBankAccountDTO): Promise<BankAccount> {
    const db = this.connection();
    const row = await db.one(
      `INSERT INTO banco_conta (id, banco_agencia_id, numero, digito, nome, tipo, descricao)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        data.bancoAgenciaId,
        data.numero,
        data.digito,
        data.nome,
        data.tipo,
        data.descricao ?? null,
      ],
    );
    return this.mapToEntity(row);
  }

  async findById(id: string): Promise<BankAccount | null> {
    const db = this.connection();
    const row = await db.oneOrNone(
      `SELECT * FROM banco_conta WHERE id = $1`,
      [id],
    );
    return row ? this.mapToEntity(row) : null;
  }

  async findAll(page: number, limit: number, bancoAgenciaId?: string): Promise<{ data: BankAccount[]; total: number }> {
    const db = this.connection();
    const offset = (page - 1) * limit;

    const rows = await db.any(
      `SELECT * FROM banco_conta WHERE ($3::uuid IS NULL OR banco_agencia_id = $3)
       ORDER BY nome LIMIT $1 OFFSET $2`,
      [limit, offset, bancoAgenciaId ?? null],
    );

    const countResult = await db.one(
      `SELECT COUNT(*) as total FROM banco_conta WHERE ($1::uuid IS NULL OR banco_agencia_id = $1)`,
      [bancoAgenciaId ?? null],
    );

    return {
      data: rows.map((row) => this.mapToEntity(row)),
      total: parseInt(countResult.total, 10),
    };
  }

  async update(id: string, data: UpdateBankAccountDTO): Promise<BankAccount> {
    const db = this.connection();
    const row = await db.one(
      `UPDATE banco_conta SET numero = COALESCE($2, numero), digito = COALESCE($3, digito),
        nome = COALESCE($4, nome), tipo = COALESCE($5, tipo),
        descricao = COALESCE($6, descricao) WHERE id = $1 RETURNING *`,
      [
        id,
        data.numero ?? null,
        data.digito ?? null,
        data.nome ?? null,
        data.tipo ?? null,
        data.descricao ?? null,
      ],
    );
    return this.mapToEntity(row);
  }

  async delete(id: string): Promise<void> {
    const db = this.connection();
    await db.none(`DELETE FROM banco_conta WHERE id = $1`, [id]);
  }

  async countByAgenciaId(agenciaId: string): Promise<number> {
    const db = this.connection();
    const result = await db.one(
      `SELECT COUNT(*) as total FROM banco_conta WHERE banco_agencia_id = $1`,
      [agenciaId],
    );
    return parseInt(result.total, 10);
  }

  private mapToEntity(row: any): BankAccount {
    const account = new BankAccount();
    account.id = row.id;
    account.bancoAgenciaId = row.banco_agencia_id;
    account.numero = row.numero;
    account.digito = row.digito;
    account.nome = row.nome;
    account.tipo = row.tipo;
    account.descricao = row.descricao;
    return account;
  }
}
