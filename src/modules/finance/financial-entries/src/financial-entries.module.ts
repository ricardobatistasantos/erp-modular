import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../../infra/databases/pg-promise/config.module';
import { FinancialEntryController } from './presentation/controllers/financial-entry.controller';
import { FinancialEntryRepository } from './infra/repository/financial-entry.repository';
import { CreateFinancialEntryUseCase } from './application/use-cases/create-financial-entry.use-case';
import { GetByIdFinancialEntryUseCase } from './application/use-cases/get-by-id-financial-entry.use-case';
import { FindAllFinancialEntriesUseCase } from './application/use-cases/find-all-financial-entries.use-case';

@Module({
  imports: [DatabaseModule],
  controllers: [FinancialEntryController],
  providers: [
    {
      provide: 'IFinancialEntryRepository',
      useClass: FinancialEntryRepository,
    },
    CreateFinancialEntryUseCase,
    GetByIdFinancialEntryUseCase,
    FindAllFinancialEntriesUseCase,
  ],
  exports: [
    CreateFinancialEntryUseCase,
    GetByIdFinancialEntryUseCase,
    FindAllFinancialEntriesUseCase,
    'IFinancialEntryRepository',
  ],
})
export class FinancialEntriesModule {}
