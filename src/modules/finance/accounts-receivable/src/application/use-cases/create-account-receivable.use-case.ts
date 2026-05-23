import { HttpException, HttpStatus, Inject } from '@nestjs/common';

import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { CreateAccountReceivableDTO } from '../dto/create-account-receivable.dto';
import { AccountReceivable } from '../../domain/entity/account-receivable.entity';
import { IAccountReceivableRepository } from '../../domain/repository/account-receivable.interface.repository';
import { IInstallmentRepository } from '../../../../installments/src/domain/repository/installment.interface.repository';
import { InstallmentCalculator } from '../../../../installments/src/domain/services/installment-calculator';
import { InstallmentValidation } from '../../../../installments/src/domain/validation/installment-validation';
import { CreateInstallmentDTO } from '../../../../installments/src/application/dto/create-installment.dto';

export class CreateAccountReceivableUseCase implements BaseUseCase<CreateAccountReceivableDTO, AccountReceivable> {
  constructor(
    @Inject('IAccountReceivableRepository')
    private readonly repository: IAccountReceivableRepository,
    @Inject('IInstallmentRepository')
    private readonly installmentRepository: IInstallmentRepository,
    private readonly installmentCalculator: InstallmentCalculator,
    private readonly installmentValidation: InstallmentValidation,
    @Inject('DATABASE_CONNECTION')
    private readonly connection: any,
  ) {}

  async execute(data: CreateAccountReceivableDTO): Promise<AccountReceivable> {
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

      return this.connection().tx(async (transaction) => {
        const account = await this.repository.create(data, transaction);

        const parcelas = this.installmentCalculator.calculate({
          valorTotal: data.valor,
          quantidadeParcelas: data.parcelamento.quantidadeParcelas,
          dataVencimentoBase: dataVencimento,
          intervaloMeses: data.parcelamento.intervaloMeses,
          valores: data.parcelamento.valores,
          datasVencimento: data.parcelamento.datasVencimento,
        });

        const installmentsData: CreateInstallmentDTO[] = parcelas.map((parcela) => ({
          origem: 'RECEBER' as const,
          origemId: account.id,
          numeroParcela: parcela.numeroParcela,
          totalParcelas: data.parcelamento.quantidadeParcelas,
          dataVencimento: parcela.dataVencimento,
          valor: parcela.valor,
        }));

        const createdInstallments = await this.installmentRepository.createMany(
          installmentsData,
          transaction,
        );

        this.installmentValidation.validateIntegrity(
          createdInstallments.map((i) => ({ valor: i.valor, status: i.status })),
          data.valor,
        );

        return account;
      });
    }

    return this.connection().tx(async (transaction) => {
      const account = await this.repository.create(data, transaction);

      const installmentData: CreateInstallmentDTO = {
        origem: 'RECEBER',
        origemId: account.id,
        numeroParcela: 1,
        totalParcelas: 1,
        dataVencimento,
        valor: data.valor,
      };

      const createdInstallments = await this.installmentRepository.createMany(
        [installmentData],
        transaction,
      );

      this.installmentValidation.validateIntegrity(
        createdInstallments.map((i) => ({ valor: i.valor, status: i.status })),
        data.valor,
      );

      return account;
    });
  }
}
