import { Module } from '@nestjs/common';
import { InventoryControlController } from './presentation/controllers/inventory-control.controller';
import { CreateInventoryControlUseCase } from './application/use-cases/create-inventory-control.use-case';
import { GetByIdInventoryControlUseCase } from './application/use-cases/get-by-id-inventory-control.use-case';

@Module({
  imports: [],
  controllers: [InventoryControlController],
  providers: [CreateInventoryControlUseCase, GetByIdInventoryControlUseCase],
})
export class InventoryControlModule {}
