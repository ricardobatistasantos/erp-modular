import { Inject } from '@nestjs/common';
import { IPaymentMethodRepository } from '../../domain/repository/payment-method.interface.repository';
import { PaymentMethod } from '../../domain/entity/payment-method.entity';
import { CreatePaymentMethodDTO } from '../../application/dto/create-payment-method.dto';
import { UpdatePaymentMethodDTO } from '../../application/dto/update-payment-method.dto';

export class PaymentMethodRepository implements IPaymentMethodRepository {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly connection: any,
  ) {}

  async create(data: CreatePaymentMethodDTO, transaction?: any): Promise<PaymentMethod> {
    const db = transaction || this.connection();
    return db.one(
      `INSERT INTO formas_pagamento (id, nome, descricao, ativo)
       VALUES (gen_random_uuid(), $1, $2, true) RETURNING *`,
      [data.nome, data.descricao ?? null],
    );
  }

  async findById(id: string): Promise<PaymentMethod | null> {
    const db = this.connection();
    return db.oneOrNone(
      `SELECT * FROM formas_pagamento WHERE id = $1`,
      [id],
    );
  }

  async findAll(page: number, limit: number): Promise<{ data: PaymentMethod[]; total: number }> {
    const db = this.connection();
    const offset = (page - 1) * limit;

    const data = await db.any(
      `SELECT * FROM formas_pagamento ORDER BY nome ASC LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    const countResult = await db.one(
      `SELECT COUNT(*) as total FROM formas_pagamento`,
    );

    return { data, total: parseInt(countResult.total, 10) };
  }

  async update(id: string, data: UpdatePaymentMethodDTO, transaction?: any): Promise<PaymentMethod> {
    const db = transaction || this.connection();
    return db.one(
      `UPDATE formas_pagamento
       SET nome = COALESCE($2, nome),
           descricao = COALESCE($3, descricao),
           ativo = COALESCE($4, ativo),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [
        id,
        data.nome ?? null,
        data.descricao ?? null,
        data.ativo ?? null,
      ],
    );
  }
}
