import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { ReceberTransferenciaDto } from '../dto/receber-transferencia.dto';
import { TransferenciaEstoque } from '../../domain/entity/transferencia-estoque.entity';
import { ITransferenciaEstoqueRepository } from '../../domain/repository/transferencia-estoque.repository';
import { CreateMovimentoEstoqueUseCase } from './create-movimento-estoque.use-case';
import { StatusTransferenciaEstoque } from '../../domain/enums/status-transferencia-estoque.enum';
import { EstoqueTipoMovimento } from '../../domain/enums/estoque-tipo-movimento.enum';
import { EstoqueOrigem } from '../../domain/enums/estoque-origem.enum';

@Injectable()
export class ReceberTransferenciaUseCase implements BaseUseCase<ReceberTransferenciaDto, TransferenciaEstoque> {
  constructor(
    @Inject('ITransferenciaEstoqueRepository')
    private readonly transferenciaRepository: ITransferenciaEstoqueRepository,
    private readonly createMovimentoEstoqueUseCase: CreateMovimentoEstoqueUseCase,
    @Inject('DATABASE_CONNECTION')
    private readonly connection: any,
  ) {}

  async execute(data: ReceberTransferenciaDto): Promise<TransferenciaEstoque> {
    // Fase 1: Validação PRÉ-transação
    const transferencia = await this.transferenciaRepository.findById(data.transferenciaId);

    if (!transferencia) {
      throw new HttpException(
        'Transferência não encontrada',
        HttpStatus.NOT_FOUND,
      );
    }

    if (
      transferencia.status !== StatusTransferenciaEstoque.EM_TRANSITO &&
      transferencia.status !== StatusTransferenciaEstoque.SEPARADA
    ) {
      throw new HttpException(
        'Transferência não está em trânsito ou separada para ser recebida',
        HttpStatus.BAD_REQUEST,
      );
    }

    const itens = await this.transferenciaRepository.findItensByTransferenciaId(
      data.transferenciaId,
    );

    // Fase 2: Transação
    return this.connection().tx(async (t) => {
      for (const item of itens) {
        // Criar movimento de saída no depósito de origem
        await this.createMovimentoEstoqueUseCase.execute({
          produtoId: item.produtoId,
          depositoId: transferencia.depositoOrigemId,
          tipo: EstoqueTipoMovimento.TRANSFERENCIA_SAIDA,
          origem: EstoqueOrigem.TRANSFERENCIA,
          origemId: data.transferenciaId,
          quantidade: item.quantidade,
          custoUnitario: 0,
        }, t);

        // Criar movimento de entrada no depósito de destino
        await this.createMovimentoEstoqueUseCase.execute({
          produtoId: item.produtoId,
          depositoId: transferencia.depositoDestinoId,
          tipo: EstoqueTipoMovimento.TRANSFERENCIA_ENTRADA,
          origem: EstoqueOrigem.TRANSFERENCIA,
          origemId: data.transferenciaId,
          quantidade: item.quantidade,
          custoUnitario: 0,
        }, t);
      }

      // Atualizar status da transferência para RECEBIDA
      const updatedTransferencia = await this.transferenciaRepository.updateStatus(
        data.transferenciaId,
        StatusTransferenciaEstoque.RECEBIDA,
        t,
      );

      return updatedTransferencia;
    });
  }
}
