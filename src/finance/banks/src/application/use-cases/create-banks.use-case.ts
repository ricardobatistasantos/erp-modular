import { BaseUseCase } from '../../domain/use-case/base.use-case';

export class CreateBanksUseCase implements BaseUseCase<any, any> {
  async execute(data: any): Promise<any> {
    return data;
  }
}
