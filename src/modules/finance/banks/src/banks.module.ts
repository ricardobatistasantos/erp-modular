import { Module } from '@nestjs/common';
import { BanksController } from './presentation/controllers/banks.controller';
import { CreateBanksUseCase } from './application/use-cases/create-banks.use-case';
import { GetByIdBanksUseCase } from './application/use-cases/get-by-id-banks.use-case';

@Module({
  imports: [],
  controllers: [BanksController],
  providers: [CreateBanksUseCase, GetByIdBanksUseCase],
})
export class BanksModule {}
