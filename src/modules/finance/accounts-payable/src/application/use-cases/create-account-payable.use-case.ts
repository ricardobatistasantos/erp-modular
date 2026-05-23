import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { CreateAccountPayableDTO } from '../dto/create-account-payable.dto';
import { AccountPayable } from '../../domain/entity/account-payable.entity';
import { IAccountPayableRepository } from '../../domain/repository/account-payable.interface.repository';
import { IInstallmentRepository } from '../../../../installments/src/domain/repository/installment.interface.repository';
import { InstallmentCalculator } from '../../../../installments/src/domain/services/installment-calculator';
import { InstallmentValidation } from '../../../../installments/src/domain/validation/installment-validation';
import { CreateInstallmentDTO } from '../../../../installments/src/application/dto/create-installment.dto';

export class CreateAccountPayableUseCase implements BaseUseCase<CreateAccountPayableDTO, AccountPayable> {
  constructor(
    @Inject('IAccountPayableRepository')
    private readonly repository: IAccountPayableRepository,
    @Inject('IInstallmentRepository')
    private readonly installmentRepository: IInstallmentRepository,
    @Inject('DATABASE_CONNECTION')
    private readonly connection: any,
    private readonly installmentCalculator: InstallmentCalculator,
    private readonly installmentValidation: InstallmentValidation,
  ) {}

  async execute(data: CreateAccountPayableDTO): Promise<AccountPayable> {
    const dataEmissao = new Date(data.dataEmissao);
    const dataVencimento = new Date(data.dataVencimento);

    if (dataVencimento < dataEmissao) {
      throw new HttpException(
        'A data de vencimento deve ser igual ou posterior à data de emissão',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (data.parcelamento) {
      this.installmentValidation.validateCreation(
        data.parcelamento,
        data.valor,
        dataEmissao,
      );
    }

    return this.connection().tx(async (transaction) => {
      const account = await this.repository.create(data, transaction);

      if (data.parcelamento) {
        const calculatedInstallments = this.installmentCalculator.calculate({
          valorTotal: data.valor,
          quantidadeParcelas: data.parcelamento.quantidadeParcelas,
          dataVencimentoBase: dataVencimento,
          intervaloMeses: data.parcelamento.intervaloMeses,
          valores: data.parcelamento.valores,
          datasVencimento: data.parcelamento.datasVencimento,
        });

        const installmentDtos: CreateInstallmentDTO[] = calculatedInstallments.map(
          (parcela) => ({
            origem: 'PAGAR' as const,
            origemId: account.id,
            numeroParcela: parcela.numeroParcela,
            totalParcelas: data.parcelamento.quantidadeParcelas,
            dataVencimento: parcela.dataVencimento,
            valor: parcela.valor,
          }),
        );

        const createdInstallments = await this.installmentRepository.createMany(
          installmentDtos,
          transaction,
        );

        this.installmentValidation.validateIntegrity(
          createdInstallments.map((i) => ({ valor: i.valor, status: i.status })),
          data.valor,
        );
      } else {
        const singleInstallment: CreateInstallmentDTO = {
          origem: 'PAGAR',
          origemId: account.id,
          numeroParcela: 1,
          totalParcelas: 1,
          dataVencimento: dataVencimento,
          valor: data.valor,
        };

        await this.installmentRepository.createMany(
          [singleInstallment],
          transaction,
        );
      }

      return account;
    });
  }
}
