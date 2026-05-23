import { Inject } from '@nestjs/common';
import { IInstallmentRepository } from '../../domain/repository/installment.interface.repository';
import { Installment } from '../../domain/entity/installment.entity';
import { CreateInstallmentDTO } from '../../application/dto/create-installment.dto';

export class InstallmentRepository implements IInstallmentRepository {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly connection: any,
  ) {}

  async create(data: CreateInstallmentDTO, transaction?: any): Promise<Installment> {
    const db = transaction || this.connection();
    return db.one(
      `INSERT INTO parcelas (id, origem, origem_id, numero_parcela, total_parcelas, data_vencimento, valor, valor_pago, status)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, 0, 'PENDENTE') RETURNING *`,
      [
        data.origem,
        data.origemId,
        data.numeroParcela,
        data.totalParcelas,
        data.dataVencimento,
        data.valor,
      ],
    );
  }

  async createMany(data: CreateInstallmentDTO[], transaction?: any): Promise<Installment[]> {
    const db = transaction || this.connection();

    if (data.length === 0) {
      return [];
    }

    const values = data
      .map(
        (_, i) =>
          `(gen_random_uuid(), $${i * 6 + 1}, $${i * 6 + 2}, $${i * 6 + 3}, $${i * 6 + 4}, $${i * 6 + 5}, $${i * 6 + 6}, 0, 'PENDENTE')`,
      )
      .join(', ');

    const params = data.flatMap((d) => [
      d.origem,
      d.origemId,
      d.numeroParcela,
      d.totalParcelas,
      d.dataVencimento,
      d.valor,
    ]);

    return db.any(
      `INSERT INTO parcelas (id, origem, origem_id, numero_parcela, total_parcelas, data_vencimento, valor, valor_pago, status)
       VALUES ${values} RETURNING *`,
      params,
    );
  }

  async findById(id: string): Promise<Installment | null> {
    const db = this.connection();
    return db.oneOrNone(`SELECT * FROM parcelas WHERE id = $1`, [id]);
  }

  async findByOrigemId(origemId: string): Promise<Installment[]> {
    const db = this.connection();
    return db.any(
      `SELECT * FROM parcelas WHERE origem_id = $1 ORDER BY numero_parcela ASC`,
      [origemId],
    );
  }

  async updateValorPago(
    id: string,
    valorPago: number,
    status: string,
    transaction?: any,
  ): Promise<Installment> {
    const db = transaction || this.connection();
    return db.one(
      `UPDATE parcelas SET valor_pago = $1, status = $2, updated_at = NOW() WHERE id = $3 RETURNING *`,
      [valorPago, status, id],
    );
  }

  async updateStatus(
    id: string,
    status: string,
    transaction?: any,
  ): Promise<Installment> {
    const db = transaction || this.connection();
    return db.one(
      `UPDATE parcelas SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, id],
    );
  }

  async hasSettlements(origemId: string): Promise<boolean> {
    const db = this.connection();
    const result = await db.oneOrNone(
      `SELECT 1 FROM parcelas p
       INNER JOIN baixas_financeiras bf ON bf.parcela_id = p.id
       WHERE p.origem_id = $1
       LIMIT 1`,
      [origemId],
    );
    return result !== null;
  }

  async updateValor(
    id: string,
    valor: number,
    transaction?: any,
  ): Promise<Installment> {
    const db = transaction || this.connection();
    return db.one(
      `UPDATE parcelas SET valor = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, valor],
    );
  }

  async cancelMany(ids: string[], transaction?: any): Promise<void> {
    if (ids.length === 0) {
      return;
    }
    const db = transaction || this.connection();
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ');
    await db.none(
      `UPDATE parcelas SET status = 'CANCELADO', updated_at = NOW() WHERE id IN (${placeholders})`,
      ids,
    );
  }

  async findPendingByOrigemId(origemId: string): Promise<Installment[]> {
    const db = this.connection();
    return db.any(
      `SELECT * FROM parcelas WHERE origem_id = $1 AND status = 'PENDENTE' ORDER BY numero_parcela ASC`,
      [origemId],
    );
  }

  async getMaxNumeroParcela(origemId: string): Promise<number> {
    const db = this.connection();
    const result = await db.one(
      `SELECT COALESCE(MAX(numero_parcela), 0) AS max_numero FROM parcelas WHERE origem_id = $1`,
      [origemId],
    );
    return Number(result.max_numero);
  }

  async hasSettlementsByParcelaIds(parcelaIds: string[]): Promise<boolean> {
    if (parcelaIds.length === 0) {
      return false;
    }
    const db = this.connection();
    const placeholders = parcelaIds.map((_, i) => `$${i + 1}`).join(', ');
    const result = await db.oneOrNone(
      `SELECT 1 FROM baixas_financeiras WHERE parcela_id IN (${placeholders}) LIMIT 1`,
      parcelaIds,
    );
    return result !== null;
  }
}
