import { IEmployeeRepository } from "../../domain/repository/enployee.interface.repository";
import { CreateEmployeeDTO } from "../../application/dto/create-employee.dto";
import { Employee } from "../../domain/entity/employee.entity";

export class EmployeeRepository implements IEmployeeRepository {
  async create(employee: CreateEmployeeDTO): Promise<Employee> {
    return {
      id: "generated-id",
      personId: "generated-person-id",
      matricula: employee.colaborador.matricula,
      dataAdmissao: employee.colaborador.dataAdmissao,
      dataDemissao: employee.colaborador.dataDemissao,
      cargo: {
        nome: employee.colaborador.cargo.nome,
        salario: employee.colaborador.cargo.salario,
      },
      departamento: {
        nome: employee.colaborador.departamento.nome,
      },
      vendedor: employee.colaborador.vendedor
        ? {
          comissao: employee.colaborador.vendedor.comissao,
          metaVendas: employee.colaborador.vendedor.metaVendas,
        }
        : undefined,
    };
  }
}