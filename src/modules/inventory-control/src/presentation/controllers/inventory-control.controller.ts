import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { CreateMovimentoEstoqueUseCase } from '../../application/use-cases/create-movimento-estoque.use-case';
import { GetSaldoByProdutoUseCase } from '../../application/use-cases/get-saldo-by-produto.use-case';
import { CreateReservaEstoqueUseCase } from '../../application/use-cases/create-reserva-estoque.use-case';
import { CreateTransferenciaUseCase } from '../../application/use-cases/create-transferencia.use-case';
import { ReceberTransferenciaUseCase } from '../../application/use-cases/receber-transferencia.use-case';
import { CreateInventarioUseCase } from '../../application/use-cases/create-inventario.use-case';
import { FinalizarInventarioUseCase } from '../../application/use-cases/finalizar-inventario.use-case';
import { CreateMovimentoEstoqueDto } from '../../application/dto/create-movimento-estoque.dto';
import { CreateReservaEstoqueDto } from '../../application/dto/create-reserva-estoque.dto';
import { CreateTransferenciaDto } from '../../application/dto/create-transferencia.dto';
import { CreateInventarioDto } from '../../application/dto/create-inventario.dto';

@Controller('inventory-control')
export class InventoryControlController {
  constructor(
    private readonly createMovimentoEstoqueUseCase: CreateMovimentoEstoqueUseCase,
    private readonly getSaldoByProdutoUseCase: GetSaldoByProdutoUseCase,
    private readonly createReservaEstoqueUseCase: CreateReservaEstoqueUseCase,
    private readonly createTransferenciaUseCase: CreateTransferenciaUseCase,
    private readonly receberTransferenciaUseCase: ReceberTransferenciaUseCase,
    private readonly createInventarioUseCase: CreateInventarioUseCase,
    private readonly finalizarInventarioUseCase: FinalizarInventarioUseCase,
  ) {}

  @Post('movement')
  createMovimento(@Body() dto: CreateMovimentoEstoqueDto) {
    return this.createMovimentoEstoqueUseCase.execute(dto);
  }

  @Get('balance/:productId')
  getSaldoByProduto(@Param('productId') productId: string) {
    return this.getSaldoByProdutoUseCase.execute(productId);
  }

  @Post('transfer')
  createTransferencia(@Body() dto: CreateTransferenciaDto) {
    return this.createTransferenciaUseCase.execute(dto);
  }

  @Put('transfer/:id/receive')
  receberTransferencia(@Param('id') id: string) {
    return this.receberTransferenciaUseCase.execute({ transferenciaId: id });
  }

  @Post('inventory')
  createInventario(@Body() dto: CreateInventarioDto) {
    return this.createInventarioUseCase.execute(dto);
  }

  @Put('inventory/:id/finalize')
  finalizarInventario(@Param('id') id: string) {
    return this.finalizarInventarioUseCase.execute({ inventarioId: id });
  }

  @Post('reserve')
  createReserva(@Body() dto: CreateReservaEstoqueDto) {
    return this.createReservaEstoqueUseCase.execute(dto);
  }
}
