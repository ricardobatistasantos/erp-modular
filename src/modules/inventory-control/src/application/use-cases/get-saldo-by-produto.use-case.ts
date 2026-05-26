import { Inject, Injectable } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { SaldoEstoque } from '../../domain/entity/saldo-estoque.entity';
import { ISaldoEstoqueRepository } from '../../domain/repository/saldo-estoque.repository';

@Injectable()
export class GetSaldoByProdutoUseCase implements BaseUseCase<string, SaldoEstoque[]> {
  constructor(
    @Inject('ISaldoEstoqueRepository')
    private readonly saldoRepository: ISaldoEstoqueRepository,
  ) {}

  async execute(produtoId: string): Promise<SaldoEstoque[]> {
    return this.saldoRepository.findByProdutoId(produtoId);
  }
}
