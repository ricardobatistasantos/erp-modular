export interface IContactRepository {
  create(data: any, transaction?: any): Promise<any>;
  deleteByPessoaId(pessoaId: string, transaction?: any): Promise<void>;
}