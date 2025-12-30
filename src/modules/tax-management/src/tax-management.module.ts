import { Module } from '@nestjs/common';
import { TaxManagementController } from './presentation/controllers/tax-management.controller';
import { CreateTaxManagementUseCase } from './application/use-cases/create-tax-management.use-case';
import { GetByIdTaxManagementUseCase } from './application/use-cases/get-by-id-tax-management.use-case';

@Module({
  imports: [],
  controllers: [TaxManagementController],
  providers: [CreateTaxManagementUseCase, GetByIdTaxManagementUseCase],
})
export class TaxManagementModule {}
