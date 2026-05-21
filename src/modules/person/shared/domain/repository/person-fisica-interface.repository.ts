export interface IPersonFisicaRepository {
  create(data: any, transaction?: any): Promise<any>;
  update(pessoaId: string, data: any, transaction?: any): Promise<any>;
}