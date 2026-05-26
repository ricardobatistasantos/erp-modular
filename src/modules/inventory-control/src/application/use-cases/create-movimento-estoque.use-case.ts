import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { CreateMovimentoEstoqueDto } from '../dto/create-movimento-estoque.dto';
import { MovimentoEstoque } from '../../domain/entity/movimento-estoque.entity';
import { SaldoEstoque } from '../../domain/entity/saldo-estoque.entity';
import { CamadaCusto } from '../../domain/entity/camada-custo.entity';
import { IMovimentoEstoqueRepository } from '../../domain/repository/movimento-estoque.repository';
import { ISaldoEstoqueRepository } from '../../domain/repository/saldo-estoque.repository';
import { ICamadaCustoRepository } from '../../domain/repository/camada-custo.repository';
import { EstoqueTipoMovimento } from '../../domain/enums/estoque-tipo-movimento.enum';
import { EstoqueOrigem } from '../../domain/enums/estoque-origem.enum';

const TIPOS_ENTRADA: EstoqueTipoMovimento[] = [
  EstoqueTipoMovimento.ENTRADA_COMPRA,
  EstoqueTipoMovimento.ENTRADA_DEVOLUCAO,
  EstoqueTipoMovimento.AJUSTE_POSITIVO,
  EstoqueTipoMovimento.TRANSFERENCIA_ENTRADA,
  EstoqueTipoMovimento.PRODUCAO_ENTRADA,
];

@Injectable()
export class CreateMovimentoEstoqueUseCase implements BaseUseCase<CreateMovimentoEstoqueDto, MovimentoEstoque> {
  constructor(
    @Inject('IMovimentoEstoqueRepository')
    private readonly movimentoRepository: IMovimentoEstoqueRepository,
    @Inject('ISaldoEstoqueRepository')
    private readonly saldoRepository: ISaldoEstoqueRepository,
    @Inject('ICamadaCustoRepository')
    private readonly camadaCustoRepository: ICamadaCustoRepository,
  ) {}

  async execute(data: CreateMovimentoEstoqueDto): Promise<MovimentoEstoque> {
    const tipo = data.tipo as EstoqueTipoMovimento;
    const isEntrada = TIPOS_ENTRADA.includes(tipo);

    const movimento = new MovimentoEstoque({
      id: randomUUID(),
      produtoId: data.produtoId,
      depositoId: data.depositoId,
      enderecoId: data.enderecoId,
      loteId: data.loteId,
      tipo,
      origem: data.origem as EstoqueOrigem,
      origemId: data.origemId,
      quantidade: data.quantidade,
      custoUnitario: data.custoUnitario,
      valorTotal: data.quantidade * data.custoUnitario,
      observacao: data.observacao,
      usuarioId: data.usuarioId,
      createdAt: new Date(),
    });

    const createdMovimento = await this.movimentoRepository.create(movimento);

    // Atualizar saldo
    let saldo = await this.saldoRepository.findByProdutoAndDeposito(
      data.produtoId,
      data.depositoId,
    );

    if (!saldo) {
      saldo = new SaldoEstoque({
        id: randomUUID(),
        produtoId: data.produtoId,
        depositoId: data.depositoId,
        enderecoId: data.enderecoId,
        loteId: data.loteId,
        saldoQuantidade: 0,
        reservado: 0,
        custoMedio: 0,
        updatedAt: new Date(),
      });
    }

    if (isEntrada) {
      const novoSaldoQuantidade = saldo.saldoQuantidade + data.quantidade;
      const custoTotalAnterior = saldo.saldoQuantidade * saldo.custoMedio;
      const custoTotalNovo = data.quantidade * data.custoUnitario;
      const novoCustoMedio =
        novoSaldoQuantidade > 0
          ? (custoTotalAnterior + custoTotalNovo) / novoSaldoQuantidade
          : data.custoUnitario;

      saldo.saldoQuantidade = novoSaldoQuantidade;
      saldo.custoMedio = novoCustoMedio;
    } else {
      saldo.saldoQuantidade = saldo.saldoQuantidade - data.quantidade;
    }

    saldo.updatedAt = new Date();

    await this.saldoRepository.upsert(saldo);

    // Se for entrada, criar camada de custo
    if (isEntrada) {
      const camada = new CamadaCusto({
        id: randomUUID(),
        produtoId: data.produtoId,
        movimentoId: createdMovimento.id,
        quantidade: data.quantidade,
        custoUnitario: data.custoUnitario,
        saldoQuantidade: data.quantidade,
        createdAt: new Date(),
      });

      await this.camadaCustoRepository.create(camada);
    }

    return createdMovimento;
  }
}
