export interface IAddressRepository {
  create(data: any, transaction?: any): Promise<any>;
}