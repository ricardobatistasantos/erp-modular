import { IEmployeeRepository } from "../../domain/repository/enployee.interface.repository";
import { CreateEmployeeDTO } from "../../application/dto/create-employee.dto";
// import { Employee } from "../../domain/entity/employee.entity";
import { Inject } from "@nestjs/common";

export class EmployeeRepository implements IEmployeeRepository {
  
  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly connection: any
  ) {}
  
  async create(data: any, transaction: any): Promise<any> {
    const db = transaction || this.connection();
    return db.one(
      `insert
        into
        colaborador (pessoa_id,
        matricula)
      values ($1,
      $2) returning *`,
      [data.pessoaId, data.matricula]
    );
  }
}