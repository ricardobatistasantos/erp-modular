import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { CreateTransferenciaDto } from '../dto/create-transferencia.dto';
import { TransferenciaEstoque } from '../../domain/entity/transferencia-estoque.entity';
import { TransferenciaItem } from '../../domain/entity/transferencia-item.entity';
import { ITransferenciaEstoqueRepository } from '../../domain/repository/transferencia-estoque.repository';
import { StatusTransferenciaEstoque } from '../../domain/enums/status-transferencia-estoque.enum';

@Injectable()
export class CreateTransferenciaUseCase implements BaseUseCase<CreateTransferenciaDto, TransferenciaEstoque> {
  constructor(
    @Inject('ITransferenciaEstoqueRepository')
    private readonly transferenciaRepository: ITransferenciaEstoqueRepository,
  ) {}

  async execute(data: CreateTransferenciaDto): Promise<TransferenciaEstoque> {
    const transferenciaId = randomUUID();

    const transferencia = new TransferenciaEstoque({
      id: transferenciaId,
      depositoOrigemId: data.depositoOrigemId,
      depositoDestinoId: data.depositoDestinoId,
      status: StatusTransferenciaEstoque.CRIADA,
      observacao: data.observacao,
      createdAt: new Date(),
    });

    const itens = data.itens.map(
      (item) =>
        new TransferenciaItem({
          id: randomUUID(),
          transferenciaId,
          produtoId: item.produtoId,
          quantidade: item.quantidade,
        }),
    );

    const createdTransferencia = await this.transferenciaRepository.create(
      transferencia,
      itens,
    );

    return createdTransferencia;
  }
}
