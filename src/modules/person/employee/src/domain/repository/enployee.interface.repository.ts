import { Employee } from "../entity/employee.entity";

export interface IEmployeeRepository {
  create(data: any): Promise<Employee>;
}