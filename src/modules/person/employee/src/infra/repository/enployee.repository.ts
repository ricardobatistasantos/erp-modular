import { IEmployeeRepository } from "../../domain/repository/enployee.interface.repository";
import { Inject } from "@nestjs/common";

export class EmployeeRepository implements IEmployeeRepository {
  
  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly connection: any
  ) {}
  
  async create(data: any, transaction: any): Promise<any> {
    const db = transaction || this.connection();
    return db.one(
      `INSERT INTO colaborador (pessoa_id, matricula, cargo_id, departamento_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [data.pessoaId, data.matricula, data.cargoId || null, data.departamentoId || null]
    );
  }

  async findAll(page: number, limit: number): Promise<{ data: any[]; total: number }> {
    const db = this.connection();
    const offset = (page - 1) * limit;

    const data = await db.any(
      `SELECT 
        c.id,
        c.pessoa_id,
        c.matricula,
        c.admissao,
        c.demissao,
        p.nome,
        p.email,
        p.tipo,
        ca.id AS cargo_id,
        ca.nome AS cargo_nome,
        ca.salario AS cargo_salario,
        d.id AS departamento_id,
        d.nome AS departamento_nome
      FROM colaborador c
      INNER JOIN pessoa p ON p.id = c.pessoa_id
      LEFT JOIN cargo ca ON ca.id = c.cargo_id
      LEFT JOIN departamento d ON d.id = c.departamento_id
      ORDER BY p.nome ASC
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await db.one(
      `SELECT COUNT(*) as total FROM colaborador`
    );

    return { data, total: parseInt(countResult.total, 10) };
  }

  async findById(id: string): Promise<any> {
    const db = this.connection();
    return db.oneOrNone(
      `SELECT 
        c.id,
        c.pessoa_id,
        c.matricula,
        c.admissao,
        c.demissao,
        p.nome,
        p.email,
        p.tipo,
        ca.id AS cargo_id,
        ca.nome AS cargo_nome,
        ca.salario AS cargo_salario,
        d.id AS departamento_id,
        d.nome AS departamento_nome
      FROM colaborador c
      INNER JOIN pessoa p ON p.id = c.pessoa_id
      LEFT JOIN cargo ca ON ca.id = c.cargo_id
      LEFT JOIN departamento d ON d.id = c.departamento_id
      WHERE c.id = $1`,
      [id]
    );
  }

  async update(id: string, data: any, transaction?: any): Promise<any> {
    const db = transaction || this.connection();
    return db.one(
      `UPDATE colaborador
       SET matricula = COALESCE($2, matricula),
           cargo_id = COALESCE($3, cargo_id),
           departamento_id = COALESCE($4, departamento_id)
       WHERE id = $1
       RETURNING *`,
      [id, data.matricula || null, data.cargoId || null, data.departamentoId || null]
    );
  }
}