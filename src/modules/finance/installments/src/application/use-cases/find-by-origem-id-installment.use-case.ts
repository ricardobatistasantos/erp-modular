import { Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { Installment } from '../../domain/entity/installment.entity';
import { IInstallmentRepository } from '../../domain/repository/installment.interface.repository';

export class FindByOrigemIdInstallmentUseCase implements BaseUseCase<{ origemId: string }, Installment[]> {
  constructor(
    @Inject('IInstallmentRepository')
    private readonly repository: IInstallmentRepository,
  ) {}

  async execute(data: { origemId: string }): Promise<Installment[]> {
    return this.repository.findByOrigemId(data.origemId);
  }
}
