import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { GenerateInstallmentsDTO } from '../dto/generate-installments.dto';
import { Installment } from '../../domain/entity/installment.entity';
import { IInstallmentRepository } from '../../domain/repository/installment.interface.repository';
import { IAccountPayableRepository } from '../../../../accounts-payable/src/domain/repository/account-payable.interface.repository';
import { IAccountReceivableRepository } from '../../../../accounts-receivable/src/domain/repository/account-receivable.interface.repository';

export class GenerateInstallmentsUseCase
  implements BaseUseCase<GenerateInstallmentsDTO, Installment[]>
{
  constructor(
    @Inject('IInstallmentRepository')
    private readonly installmentRepository: IInstallmentRepository,
    @Inject('IAccountPayableRepository')
    private readonly accountPayableRepository: IAccountPayableRepository,
    @Inject('IAccountReceivableRepository')
    private readonly accountReceivableRepository: IAccountReceivableRepository,
    @Inject('DATABASE_CONNECTION')
    private readonly connection: any,
  ) {}

  async execute(data: GenerateInstallmentsDTO): Promise<Installment[]> {
    // 1. Validate quantity
    if (!data.quantidadeParcelas || data.quantidadeParcelas < 1) {
      throw new HttpException(
        'Quantidade de parcelas deve ser maior que zero',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 2. Validate account exists
    let account: any;
    if (data.tipoConta === 'PAGAR') {
      account = await this.accountPayableRepository.findById(data.contaId);
      if (!account) {
        throw new HttpException(
          'Conta a pagar não encontrada',
          HttpStatus.NOT_FOUND,
        );
      }
    } else {
      account = await this.accountReceivableRepository.findById(data.contaId);
      if (!account) {
        throw new HttpException(
          'Conta a receber não encontrada',
          HttpStatus.NOT_FOUND,
        );
      }
    }

    // 3. Check if installments with settlements already exist
    const hasSettlements = await this.installmentRepository.hasSettlements(
      data.contaId,
    );
    if (hasSettlements) {
      throw new HttpException(
        'Não é possível re-gerar parcelas: existem baixas financeiras vinculadas',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 4. Calculate installment values with proportional distribution
    const totalValue = Number(account.valor);
    const quantity = data.quantidadeParcelas;
    const baseValue = Math.floor((totalValue * 100) / quantity) / 100;
    const remainder =
      Math.round((totalValue - baseValue * quantity) * 100) / 100;

    // 5. Calculate due dates with monthly interval
    const intervaloMeses = data.intervaloMeses || 1;
    const baseDate = new Date(account.dataVencimento);

    // 6. Build installment data
    const installmentsData = [];
    for (let i = 0; i < quantity; i++) {
      const valor = i === quantity - 1 ? baseValue + remainder : baseValue;

      const dataVencimento = new Date(baseDate);
      dataVencimento.setMonth(dataVencimento.getMonth() + i * intervaloMeses);

      installmentsData.push({
        origem: data.tipoConta,
        origemId: data.contaId,
        numeroParcela: i + 1,
        totalParcelas: quantity,
        dataVencimento,
        valor: Math.round(valor * 100) / 100,
      });
    }

    // 7. Create installments within a transaction
    return this.connection().tx(async (transaction) => {
      return this.installmentRepository.createMany(
        installmentsData,
        transaction,
      );
    });
  }
}
