export interface ISalesProfileRepository {
  create(data: any, transaction?: any): Promise<any>;
  update(colaboradorId: string, data: any, transaction?: any): Promise<any>;
  findByColaboradorId(colaboradorId: string, transaction?: any): Promise<any | null>;
}
