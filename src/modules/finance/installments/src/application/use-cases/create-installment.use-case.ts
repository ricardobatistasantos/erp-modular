import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { CreateInstallmentDTO } from '../dto/create-installment.dto';
import { Installment } from '../../domain/entity/installment.entity';
import { IInstallmentRepository } from '../../domain/repository/installment.interface.repository';
import { IAccountPayableRepository } from '../../../../accounts-payable/src/domain/repository/account-payable.interface.repository';
import { IAccountReceivableRepository } from '../../../../accounts-receivable/src/domain/repository/account-receivable.interface.repository';

export class CreateInstallmentUseCase implements BaseUseCase<CreateInstallmentDTO, Installment> {
  constructor(
    @Inject('IInstallmentRepository')
    private readonly repository: IInstallmentRepository,
    @Inject('IAccountPayableRepository')
    private readonly accountPayableRepository: IAccountPayableRepository,
    @Inject('IAccountReceivableRepository')
    private readonly accountReceivableRepository: IAccountReceivableRepository,
  ) {}

  async execute(data: CreateInstallmentDTO): Promise<Installment> {
    if (data.numeroParcela > data.totalParcelas) {
      throw new HttpException(
        'O número da parcela não pode exceder o total de parcelas',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (data.origem === 'PAGAR') {
      const account = await this.accountPayableRepository.findById(data.origemId);
      if (!account) {
        throw new HttpException(
          'Conta a pagar de origem não encontrada',
          HttpStatus.NOT_FOUND,
        );
      }
    } else if (data.origem === 'RECEBER') {
      const account = await this.accountReceivableRepository.findById(data.origemId);
      if (!account) {
        throw new HttpException(
          'Conta a receber de origem não encontrada',
          HttpStatus.NOT_FOUND,
        );
      }
    }

    return this.repository.create(data);
  }
}
