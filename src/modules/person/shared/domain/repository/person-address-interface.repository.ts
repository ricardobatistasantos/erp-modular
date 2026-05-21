export interface IAddressRepository {
  create(data: any, transaction?: any): Promise<any>;
  deleteByPessoaId(pessoaId: string, transaction?: any): Promise<void>;
}