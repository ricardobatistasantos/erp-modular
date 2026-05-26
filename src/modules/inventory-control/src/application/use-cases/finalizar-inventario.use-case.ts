import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { FinalizarInventarioDto } from '../dto/finalizar-inventario.dto';
import { Inventario } from '../../domain/entity/inventario.entity';
import { IInventarioRepository } from '../../domain/repository/inventario.repository';
import { CreateMovimentoEstoqueUseCase } from './create-movimento-estoque.use-case';
import { EstoqueTipoMovimento } from '../../domain/enums/estoque-tipo-movimento.enum';
import { EstoqueOrigem } from '../../domain/enums/estoque-origem.enum';

@Injectable()
export class FinalizarInventarioUseCase implements BaseUseCase<FinalizarInventarioDto, Inventario> {
  constructor(
    @Inject('IInventarioRepository')
    private readonly inventarioRepository: IInventarioRepository,
    private readonly createMovimentoEstoqueUseCase: CreateMovimentoEstoqueUseCase,
  ) {}

  async execute(data: FinalizarInventarioDto): Promise<Inventario> {
    const inventario = await this.inventarioRepository.findById(data.inventarioId);

    if (!inventario) {
      throw new HttpException(
        'Inventário não encontrado',
        HttpStatus.NOT_FOUND,
      );
    }

    if (inventario.status !== 'ABERTO') {
      throw new HttpException(
        'Inventário não está com status ABERTO',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Buscar itens do inventário
    const itens = await this.inventarioRepository.findItensByInventarioId(data.inventarioId);

    // Para cada item com divergência, criar movimento de ajuste
    for (const item of itens) {
      const divergencia = item.divergencia;

      if (divergencia === 0) {
        continue;
      }

      const tipo =
        divergencia > 0
          ? EstoqueTipoMovimento.AJUSTE_POSITIVO
          : EstoqueTipoMovimento.AJUSTE_NEGATIVO;

      await this.createMovimentoEstoqueUseCase.execute({
        produtoId: item.produtoId,
        depositoId: inventario.depositoId,
        tipo,
        origem: EstoqueOrigem.INVENTARIO,
        origemId: data.inventarioId,
        quantidade: Math.abs(divergencia),
        custoUnitario: 0,
      });
    }

    // Finalizar inventário
    const finalizado = await this.inventarioRepository.finalize(data.inventarioId);

    return finalizado;
  }
}
