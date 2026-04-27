export interface IPersonRepository {
  create(data: any, transaction?: any): Promise<any>;
} 