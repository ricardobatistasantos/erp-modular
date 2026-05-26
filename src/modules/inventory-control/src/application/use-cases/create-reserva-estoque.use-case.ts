import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { CreateReservaEstoqueDto } from '../dto/create-reserva-estoque.dto';
import { ReservaEstoque } from '../../domain/entity/reserva-estoque.entity';
import { IReservaEstoqueRepository } from '../../domain/repository/reserva-estoque.repository';
import { ISaldoEstoqueRepository } from '../../domain/repository/saldo-estoque.repository';
import { StatusReservaEstoque } from '../../domain/enums/status-reserva-estoque.enum';

@Injectable()
export class CreateReservaEstoqueUseCase implements BaseUseCase<CreateReservaEstoqueDto, ReservaEstoque> {
  constructor(
    @Inject('IReservaEstoqueRepository')
    private readonly reservaRepository: IReservaEstoqueRepository,
    @Inject('ISaldoEstoqueRepository')
    private readonly saldoRepository: ISaldoEstoqueRepository,
  ) {}

  async execute(data: CreateReservaEstoqueDto): Promise<ReservaEstoque> {
    const saldo = await this.saldoRepository.findByProdutoAndDeposito(
      data.produtoId,
      data.depositoId,
    );

    if (!saldo) {
      throw new HttpException(
        'Saldo não encontrado para o produto e depósito informados',
        HttpStatus.NOT_FOUND,
      );
    }

    if (saldo.disponivel < data.quantidade) {
      throw new HttpException(
        `Saldo disponível insuficiente. Disponível: ${saldo.disponivel}, Solicitado: ${data.quantidade}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const reserva = new ReservaEstoque({
      id: randomUUID(),
      produtoId: data.produtoId,
      depositoId: data.depositoId,
      origem: data.origem,
      origemId: data.origemId,
      quantidade: data.quantidade,
      status: StatusReservaEstoque.RESERVADO,
      createdAt: new Date(),
    });

    const createdReserva = await this.reservaRepository.create(reserva);

    // Atualizar saldo reservado
    saldo.reservado = saldo.reservado + data.quantidade;
    saldo.updatedAt = new Date();

    await this.saldoRepository.upsert(saldo);

    return createdReserva;
  }
}
