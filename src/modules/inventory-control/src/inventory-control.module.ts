import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../infra/databases/pg-promise/config.module';
import { InventoryControlController } from './presentation/controllers/inventory-control.controller';
import { DepositoRepository } from './infra/repository/deposito.repository';
import { MovimentoEstoqueRepository } from './infra/repository/movimento-estoque.repository';
import { SaldoEstoqueRepository } from './infra/repository/saldo-estoque.repository';
import { ReservaEstoqueRepository } from './infra/repository/reserva-estoque.repository';
import { TransferenciaEstoqueRepository } from './infra/repository/transferencia-estoque.repository';
import { InventarioRepository } from './infra/repository/inventario.repository';
import { CamadaCustoRepository } from './infra/repository/camada-custo.repository';
import { CreateMovimentoEstoqueUseCase } from './application/use-cases/create-movimento-estoque.use-case';
import { GetSaldoByProdutoUseCase } from './application/use-cases/get-saldo-by-produto.use-case';
import { CreateReservaEstoqueUseCase } from './application/use-cases/create-reserva-estoque.use-case';
import { CreateTransferenciaUseCase } from './application/use-cases/create-transferencia.use-case';
import { ReceberTransferenciaUseCase } from './application/use-cases/receber-transferencia.use-case';
import { CreateInventarioUseCase } from './application/use-cases/create-inventario.use-case';
import { FinalizarInventarioUseCase } from './application/use-cases/finalizar-inventario.use-case';

@Module({
  imports: [DatabaseModule],
  controllers: [InventoryControlController],
  providers: [
    {
      provide: 'IDepositoRepository',
      useClass: DepositoRepository,
    },
    {
      provide: 'IMovimentoEstoqueRepository',
      useClass: MovimentoEstoqueRepository,
    },
    {
      provide: 'ISaldoEstoqueRepository',
      useClass: SaldoEstoqueRepository,
    },
    {
      provide: 'IReservaEstoqueRepository',
      useClass: ReservaEstoqueRepository,
    },
    {
      provide: 'ITransferenciaEstoqueRepository',
      useClass: TransferenciaEstoqueRepository,
    },
    {
      provide: 'IInventarioRepository',
      useClass: InventarioRepository,
    },
    {
      provide: 'ICamadaCustoRepository',
      useClass: CamadaCustoRepository,
    },
    CreateMovimentoEstoqueUseCase,
    GetSaldoByProdutoUseCase,
    CreateReservaEstoqueUseCase,
    CreateTransferenciaUseCase,
    ReceberTransferenciaUseCase,
    CreateInventarioUseCase,
    FinalizarInventarioUseCase,
  ],
  exports: [
    CreateMovimentoEstoqueUseCase,
    GetSaldoByProdutoUseCase,
    CreateReservaEstoqueUseCase,
    CreateTransferenciaUseCase,
    ReceberTransferenciaUseCase,
    CreateInventarioUseCase,
    FinalizarInventarioUseCase,
  ],
})
export class InventoryControlModule {}
