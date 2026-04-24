import { IEmployeeRepository } from "../../domain/repository/enployee.interface.repository";
import { CreateEmployeeDTO } from "../../application/dto/create-employee.dto";
import { Employee } from "../../domain/entity/employee.entity";
import { Inject } from "@nestjs/common";

export class EmployeeRepository implements IEmployeeRepository {
  
  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly connection: any
  ) {}
  
  async create(employee: CreateEmployeeDTO, transaction: any): Promise<Employee> {
    const db = transaction || this.connection();
    return db.one(
      `INSERT INTO employees (name, position, department) VALUES ($1, $2, $3) RETURNING *`,
      [employee.pessoa.name, employee.colaborador.position, employee.colaborador.department]
    );
  }
}