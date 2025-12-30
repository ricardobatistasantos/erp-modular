import { Module } from '@nestjs/common';
import { ClientController } from './presentation/controllers/client.controller';
import { CreateClientUseCase } from './application/use-cases/create-client.use-case';
import { GetByIdClientUseCase } from './application/use-cases/get-by-id-client.use-case';

@Module({
  imports: [],
  controllers: [ClientController],
  providers: [CreateClientUseCase, GetByIdClientUseCase],
})
export class ClientModule {}
