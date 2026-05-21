import { Inject } from '@nestjs/common';
import { IFinancialEntryRepository } from '../../domain/repository/financial-entry.interface.repository';
import { FinancialEntry } from '../../domain/entity/financial-entry.entity';
import { CreateFinancialEntryDTO } from '../../application/dto/create-financial-entry.dto';

export class FinancialEntryRepository implements IFinancialEntryRepository {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly connection: any,
  ) {}

  async create(data: CreateFinancialEntryDTO, transaction?: any): Promise<FinancialEntry> {
    const db = transaction || this.connection();
    return db.one(
      `INSERT INTO lancamentos_financeiros (id, tipo, origem, origem_id, plano_conta_id, centro_custo_id, conta_bancaria_id, caixa_id, data_lancamento, descricao, valor, saldo_anterior, saldo_posterior)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [
        data.tipo,
        data.origem,
        data.origemId,
        data.planoContaId,
        data.centroCustoId ?? null,
        data.contaBancariaId ?? null,
        data.caixaId ?? null,
        data.dataLancamento,
        data.descricao,
        data.valor,
        null,
        null,
      ],
    );
  }

  async findById(id: string): Promise<FinancialEntry | null> {
    const db = this.connection();
    return db.oneOrNone(
      `SELECT * FROM lancamentos_financeiros WHERE id = $1`,
      [id],
    );
  }

  async findAll(page: number, limit: number): Promise<{ data: FinancialEntry[]; total: number }> {
    const db = this.connection();
    const offset = (page - 1) * limit;

    const data = await db.any(
      `SELECT * FROM lancamentos_financeiros ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    const countResult = await db.one(
      `SELECT COUNT(*) as total FROM lancamentos_financeiros`,
    );

    return { data, total: parseInt(countResult.total, 10) };
  }
}
