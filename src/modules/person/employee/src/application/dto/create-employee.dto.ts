import { CreatePersonDTO } from "@person/shared/dto/create-person.dto";
import { EmployeeDTO } from "./employee.dto";

export class CreateEmployeeDTO {
  
  pessoa: CreatePersonDTO;

  colaborador: EmployeeDTO;

  createUser: boolean;
}
