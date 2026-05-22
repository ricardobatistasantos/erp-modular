import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../../infra/databases/pg-promise/config.module';
import { BanksController } from './presentation/controllers/banks.controller';
import { BankRepository } from './infra/repository/bank.repository';
import { CreateBankUseCase } from './application/use-cases/create-bank.use-case';
import { GetByIdBankUseCase } from './application/use-cases/get-by-id-bank.use-case';
import { FindAllBanksUseCase } from './application/use-cases/find-all-banks.use-case';
import { UpdateBankUseCase } from './application/use-cases/update-bank.use-case';
import { DeleteBankUseCase } from './application/use-cases/delete-bank.use-case';

@Module({
  imports: [DatabaseModule],
  controllers: [BanksController],
  providers: [
    { provide: 'IBankRepository', useClass: BankRepository },
    CreateBankUseCase,
    GetByIdBankUseCase,
    FindAllBanksUseCase,
    UpdateBankUseCase,
    DeleteBankUseCase,
  ],
  exports: ['IBankRepository'],
})
export class BanksModule {}
