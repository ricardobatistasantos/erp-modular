import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { Installment } from '../../domain/entity/installment.entity';
import { IInstallmentRepository } from '../../domain/repository/installment.interface.repository';

export class GetByIdInstallmentUseCase implements BaseUseCase<{ id: string }, Installment> {
  constructor(
    @Inject('IInstallmentRepository')
    private readonly repository: IInstallmentRepository,
  ) {}

  async execute(data: { id: string }): Promise<Installment> {
    const installment = await this.repository.findById(data.id);

    if (!installment) {
      throw new HttpException(
        'Parcela não encontrada',
        HttpStatus.NOT_FOUND,
      );
    }

    return installment;
  }
}
