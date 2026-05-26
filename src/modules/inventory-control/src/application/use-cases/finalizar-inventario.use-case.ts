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
    @Inject('DATABASE_CONNECTION')
    private readonly connection: any,
  ) {}

  async execute(data: FinalizarInventarioDto): Promise<Inventario> {
    // Fase 1: Validação PRÉ-transação
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

    const itens = await this.inventarioRepository.findItensByInventarioId(data.inventarioId);

    // Fase 2: Transação
    return this.connection().tx(async (t) => {
      for (const item of itens) {
        const divergencia = item.divergencia;
        if (divergencia === 0) continue;

        const tipo = divergencia > 0
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
        }, t);
      }

      const finalizado = await this.inventarioRepository.finalize(data.inventarioId, t);
      return finalizado;
    });
  }
}
