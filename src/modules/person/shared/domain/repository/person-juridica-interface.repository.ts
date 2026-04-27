export interface IPersonJuridicaRepository {
  create(data: any, transaction?: any): Promise<any>;
} 