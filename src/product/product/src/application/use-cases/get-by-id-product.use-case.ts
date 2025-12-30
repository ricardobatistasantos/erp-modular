import { BaseUseCase } from '../../domain/use-case/base.use-case';

export class GetByIdProductUseCase implements BaseUseCase<any, any> {
  async execute(data: any): Promise<any> {
    return data;
  }
}
