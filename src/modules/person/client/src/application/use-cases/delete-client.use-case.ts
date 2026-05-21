import { Inject, NotFoundException } from '@nestjs/common';
import { IClientRepository } from '../../domain/repository/client.interface.repository';
import { BaseUseCase } from '../../domain/use-case/base.use-case';

export class DeleteClientUseCase implements BaseUseCase<any, void> {
  constructor(
    @Inject('IClientRepository')
    private readonly clientRepository: IClientRepository,
  ) {}

  async execute(data: { id: string }): Promise<void> {
    const client = await this.clientRepository.findById(data.id);

    if (!client) {
      throw new NotFoundException(`Cliente não encontrado`);
    }

    await this.clientRepository.delete(data.id);
  }
}
