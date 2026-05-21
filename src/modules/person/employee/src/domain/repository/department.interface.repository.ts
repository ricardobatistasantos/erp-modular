export interface IDepartmentRepository {
  create(data: any, transaction?: any): Promise<any>;
  update(id: string, data: any, transaction?: any): Promise<any>;
}
