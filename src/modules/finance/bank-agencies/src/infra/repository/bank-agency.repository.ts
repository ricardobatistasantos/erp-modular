import { Inject } from '@nestjs/common';
import { IBankAgencyRepository } from '../../domain/repository/bank-agency.interface.repository';
import { BankAgency } from '../../domain/entity/bank-agency.entity';
import { CreateBankAgencyDTO } from '../../application/dto/create-bank-agency.dto';
import { UpdateBankAgencyDTO } from '../../application/dto/update-bank-agency.dto';

export class BankAgencyRepository implements IBankAgencyRepository {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly connection: any,
  ) {}

  async create(data: CreateBankAgencyDTO): Promise<BankAgency> {
    const db = this.connection();
    const row = await db.one(
      `INSERT INTO banco_agencia (id, banco_id, numero, digito, nome, contato, gerente, observacao)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        data.bancoId,
        data.numero,
        data.digito,
        data.nome,
        data.contato ?? null,
        data.gerente ?? null,
        data.observacao ?? null,
      ],
    );
    return this.mapToEntity(row);
  }

  async findById(id: string): Promise<BankAgency | null> {
    const db = this.connection();
    const row = await db.oneOrNone(
      `SELECT * FROM banco_agencia WHERE id = $1`,
      [id],
    );
    return row ? this.mapToEntity(row) : null;
  }

  async findAll(page: number, limit: number, bancoId?: string): Promise<{ data: BankAgency[]; total: number }> {
    const db = this.connection();
    const offset = (page - 1) * limit;

    const rows = await db.any(
      `SELECT * FROM banco_agencia WHERE ($3::uuid IS NULL OR banco_id = $3)
       ORDER BY nome LIMIT $1 OFFSET $2`,
      [limit, offset, bancoId ?? null],
    );

    const countResult = await db.one(
      `SELECT COUNT(*) as total FROM banco_agencia WHERE ($1::uuid IS NULL OR banco_id = $1)`,
      [bancoId ?? null],
    );

    return {
      data: rows.map((row) => this.mapToEntity(row)),
      total: parseInt(countResult.total, 10),
    };
  }

  async update(id: string, data: UpdateBankAgencyDTO): Promise<BankAgency> {
    const db = this.connection();
    const row = await db.one(
      `UPDATE banco_agencia SET numero = COALESCE($2, numero), digito = COALESCE($3, digito),
        nome = COALESCE($4, nome), contato = COALESCE($5, contato),
        gerente = COALESCE($6, gerente), observacao = COALESCE($7, observacao)
       WHERE id = $1 RETURNING *`,
      [
        id,
        data.numero ?? null,
        data.digito ?? null,
        data.nome ?? null,
        data.contato ?? null,
        data.gerente ?? null,
        data.observacao ?? null,
      ],
    );
    return this.mapToEntity(row);
  }

  async delete(id: string): Promise<void> {
    const db = this.connection();
    await db.none(`DELETE FROM banco_agencia WHERE id = $1`, [id]);
  }

  async countByBancoId(bancoId: string): Promise<number> {
    const db = this.connection();
    const result = await db.one(
      `SELECT COUNT(*) as total FROM banco_agencia WHERE banco_id = $1`,
      [bancoId],
    );
    return parseInt(result.total, 10);
  }

  private mapToEntity(row: any): BankAgency {
    const agency = new BankAgency();
    agency.id = row.id;
    agency.bancoId = row.banco_id;
    agency.numero = row.numero;
    agency.digito = row.digito;
    agency.nome = row.nome;
    agency.contato = row.contato;
    agency.gerente = row.gerente;
    agency.observacao = row.observacao;
    return agency;
  }
}
