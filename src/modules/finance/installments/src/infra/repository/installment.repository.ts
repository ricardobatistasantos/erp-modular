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
      `INSERT INTO parcelas (id, origem, origem_id, numero_parcela, total_parcelas, data_vencimento, valor, status)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, 'PENDENTE') RETURNING *`,
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

  async findById(id: string): Promise<Installment | null> {
    const db = this.connection();
    return db.oneOrNone(
      `SELECT * FROM parcelas WHERE id = $1`,
      [id],
    );
  }

  async findByOrigemId(origemId: string): Promise<Installment[]> {
    const db = this.connection();
    return db.any(
      `SELECT * FROM parcelas WHERE origem_id = $1 ORDER BY numero_parcela ASC`,
      [origemId],
    );
  }
}
