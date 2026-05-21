import { Employee } from "../entity/employee.entity";

export interface IEmployeeRepository {
  create(data: any, transaction?: any): Promise<Employee>;
  findById(id: string): Promise<any>;
  findAll(page: number, limit: number): Promise<{ data: any[]; total: number }>;
  update(id: string, data: any, transaction?: any): Promise<any>;
}