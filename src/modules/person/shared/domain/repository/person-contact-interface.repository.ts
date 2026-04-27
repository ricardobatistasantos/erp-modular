export interface IContactRepository {
  create(data: any, transaction?: any): Promise<any>;
}