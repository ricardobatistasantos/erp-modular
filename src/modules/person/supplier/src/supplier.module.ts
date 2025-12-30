import { Module } from '@nestjs/common';
import { SupplierController } from './presentation/controllers/supplier.controller';
import { CreateSupplierUseCase } from './application/use-cases/create-supplier.use-case';
import { GetByIdSupplierUseCase } from './application/use-cases/get-by-id-supplier.use-case';

@Module({
  imports: [],
  controllers: [SupplierController],
  providers: [CreateSupplierUseCase, GetByIdSupplierUseCase],
})
export class SupplierModule {}
