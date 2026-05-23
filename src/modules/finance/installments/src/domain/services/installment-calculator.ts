export interface InstallmentCalculationInput {
  valorTotal: number;
  quantidadeParcelas: number;
  dataVencimentoBase: Date;
  intervaloMeses?: number;
  valores?: number[];
  datasVencimento?: Date[];
}

export interface InstallmentCalculationOutput {
  numeroParcela: number;
  valor: number;
  dataVencimento: Date;
}

export class InstallmentCalculator {
  /**
   * Calcula parcelas com distribuição proporcional ou personalizada.
   * Garante que a soma dos valores === valorTotal (precisão de 2 casas decimais).
   */
  calculate(input: InstallmentCalculationInput): InstallmentCalculationOutput[] {
    const {
      valorTotal,
      quantidadeParcelas,
      dataVencimentoBase,
      intervaloMeses = 1,
      valores,
      datasVencimento,
    } = input;

    this.validateMinimumValue(valorTotal, quantidadeParcelas);

    const parcelas: InstallmentCalculationOutput[] = [];

    for (let i = 0; i < quantidadeParcelas; i++) {
      const numeroParcela = i + 1;
      const valor = valores
        ? valores[i]
        : this.calcularValorProporcional(valorTotal, quantidadeParcelas, i);
      const dataVencimento = datasVencimento
        ? new Date(datasVencimento[i])
        : this.calcularDataVencimento(dataVencimentoBase, i * intervaloMeses);

      parcelas.push({ numeroParcela, valor, dataVencimento });
    }

    return parcelas;
  }

  /**
   * Recalcula apenas parcelas pendentes redistribuindo o valor restante.
   */
  recalculate(
    valorRestante: number,
    parcelasPendentes: { numeroParcela: number; dataVencimento: Date }[],
  ): InstallmentCalculationOutput[] {
    const quantidade = parcelasPendentes.length;

    this.validateMinimumValue(valorRestante, quantidade);

    const parcelas: InstallmentCalculationOutput[] = [];

    for (let i = 0; i < quantidade; i++) {
      const valor = this.calcularValorProporcional(
        valorRestante,
        quantidade,
        i,
      );

      parcelas.push({
        numeroParcela: parcelasPendentes[i].numeroParcela,
        valor,
        dataVencimento: parcelasPendentes[i].dataVencimento,
      });
    }

    return parcelas;
  }

  /**
   * Calcula o valor de uma parcela na distribuição proporcional.
   * Trunca em 2 casas decimais e adiciona o resíduo à última parcela.
   */
  private calcularValorProporcional(
    valorTotal: number,
    quantidadeParcelas: number,
    indice: number,
  ): number {
    const baseValue = Math.floor((valorTotal * 100) / quantidadeParcelas) / 100;

    if (indice === quantidadeParcelas - 1) {
      const somaAnteriores = Math.round(baseValue * (quantidadeParcelas - 1) * 100) / 100;
      const ultimaParcela = Math.round((valorTotal - somaAnteriores) * 100) / 100;
      return ultimaParcela;
    }

    return baseValue;
  }

  /**
   * Calcula a data de vencimento adicionando meses à data base,
   * respeitando o último dia do mês.
   *
   * Exemplo: 31/01 + 1 mês = 28/02 (ou 29/02 em ano bissexto)
   *
   * Opera em UTC para evitar problemas de timezone.
   */
  private calcularDataVencimento(dataBase: Date, mesesAdicionar: number): Date {
    if (mesesAdicionar === 0) {
      return new Date(dataBase);
    }

    const diaOriginal = dataBase.getUTCDate();
    const mesOriginal = dataBase.getUTCMonth();
    const anoOriginal = dataBase.getUTCFullYear();

    const totalMeses = mesOriginal + mesesAdicionar;
    const novoAno = anoOriginal + Math.floor(totalMeses / 12);
    const novoMes = totalMeses % 12;

    const ultimoDiaMesResultante = this.getUltimoDiaMes(novoAno, novoMes);
    const novoDia = Math.min(diaOriginal, ultimoDiaMesResultante);

    return new Date(Date.UTC(novoAno, novoMes, novoDia));
  }

  /**
   * Retorna o último dia de um mês/ano específico.
   */
  private getUltimoDiaMes(ano: number, mes: number): number {
    return new Date(Date.UTC(ano, mes + 1, 0)).getUTCDate();
  }

  /**
   * Valida que o valor por parcela não é inferior a R$ 0,01.
   */
  private validateMinimumValue(
    valorTotal: number,
    quantidadeParcelas: number,
  ): void {
    if (valorTotal / quantidadeParcelas < 0.01) {
      throw new Error(
        'Valor total insuficiente para a quantidade de parcelas solicitada',
      );
    }
  }
}
