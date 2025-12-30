import { BaseUseCase } from '../../domain/use-case/base.use-case';

export class CreateAccountsPayableUseCase implements BaseUseCase<any, any> {
  async execute(data: any): Promise<any> {
    return data;
  }
}
