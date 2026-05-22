import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../../infra/databases/pg-promise/config.module';
import { BanksModule } from '../../banks/src/banks.module';
import { BankAgenciesController } from './presentation/controllers/bank-agencies.controller';
import { BankAgencyRepository } from './infra/repository/bank-agency.repository';
import { CreateBankAgencyUseCase } from './application/use-cases/create-bank-agency.use-case';
import { GetByIdBankAgencyUseCase } from './application/use-cases/get-by-id-bank-agency.use-case';
import { FindAllBankAgenciesUseCase } from './application/use-cases/find-all-bank-agencies.use-case';
import { UpdateBankAgencyUseCase } from './application/use-cases/update-bank-agency.use-case';
import { DeleteBankAgencyUseCase } from './application/use-cases/delete-bank-agency.use-case';

@Module({
  imports: [DatabaseModule, BanksModule],
  controllers: [BankAgenciesController],
  providers: [
    { provide: 'IBankAgencyRepository', useClass: BankAgencyRepository },
    CreateBankAgencyUseCase,
    GetByIdBankAgencyUseCase,
    FindAllBankAgenciesUseCase,
    UpdateBankAgencyUseCase,
    DeleteBankAgencyUseCase,
  ],
  exports: ['IBankAgencyRepository'],
})
export class BankAgenciesModule {}
