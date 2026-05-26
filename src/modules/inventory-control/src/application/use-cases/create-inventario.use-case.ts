import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { CreateInventarioDto } from '../dto/create-inventario.dto';
import { Inventario } from '../../domain/entity/inventario.entity';
import { InventarioItem } from '../../domain/entity/inventario-item.entity';
import { IInventarioRepository } from '../../domain/repository/inventario.repository';
import { ISaldoEstoqueRepository } from '../../domain/repository/saldo-estoque.repository';

@Injectable()
export class CreateInventarioUseCase implements BaseUseCase<CreateInventarioDto, Inventario> {
  constructor(
    @Inject('IInventarioRepository')
    private readonly inventarioRepository: IInventarioRepository,
    @Inject('ISaldoEstoqueRepository')
    private readonly saldoRepository: ISaldoEstoqueRepository,
  ) {}

  async execute(data: CreateInventarioDto): Promise<Inventario> {
    const inventario = new Inventario({
      id: randomUUID(),
      depositoId: data.depositoId,
      status: 'ABERTO',
      iniciadoEm: new Date(),
      createdAt: new Date(),
    });

    const createdInventario = await this.inventarioRepository.create(inventario);

    // Carregar saldos atuais do depósito e criar itens do inventário
    const saldos = await this.saldoRepository.findByDepositoId(data.depositoId);

    for (const saldo of saldos) {
      const item = new InventarioItem({
        id: randomUUID(),
        inventarioId: createdInventario.id,
        produtoId: saldo.produtoId,
        saldoSistema: saldo.saldoQuantidade,
        saldoFisico: 0,
      });

      await this.inventarioRepository.createItem(item);
    }

    return createdInventario;
  }
}
