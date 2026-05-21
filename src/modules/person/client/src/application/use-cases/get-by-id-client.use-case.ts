import { Inject, NotFoundException } from '@nestjs/common';
import { IClientRepository } from '../../domain/repository/client.interface.repository';
import { BaseUseCase } from '../../domain/use-case/base.use-case';

export class GetByIdClientUseCase implements BaseUseCase<any, any> {
  constructor(
    @Inject('IClientRepository')
    private readonly clientRepository: IClientRepository,
  ) {}

  async execute(data: { id: string }): Promise<any> {
    const client = await this.clientRepository.findById(data.id);

    if (!client) {
      throw new NotFoundException(`Cliente não encontrado`);
    }

    return client;
  }
}
