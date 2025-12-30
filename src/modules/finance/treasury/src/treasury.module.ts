import { Module } from '@nestjs/common';
import { TreasuryController } from './presentation/controllers/treasury.controller';
import { CreateTreasuryUseCase } from './application/use-cases/create-treasury.use-case';
import { GetByIdTreasuryUseCase } from './application/use-cases/get-by-id-treasury.use-case';

@Module({
  imports: [],
  controllers: [TreasuryController],
  providers: [CreateTreasuryUseCase, GetByIdTreasuryUseCase],
})
export class TreasuryModule {}
