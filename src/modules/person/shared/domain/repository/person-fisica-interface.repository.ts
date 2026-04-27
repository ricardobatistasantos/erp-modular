export interface IPersonFisicaRepository {
  create(data: any, transaction?: any): Promise<any>;
}