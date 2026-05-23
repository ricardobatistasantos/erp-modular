import { HttpException, HttpStatus } from '@nestjs/common';

export interface ParcelamentoInput {
  quantidadeParcelas: number;
  valores?: number[];
  datasVencimento?: Date[];
  intervaloMeses?: number;
}

export class InstallmentValidation {
  /**
   * Valida os dados de parcelamento antes da criação.
   * Lança HttpException em caso de erro.
   */
  validateCreation(
    parcelamento: ParcelamentoInput,
    valorTotal: number,
    dataEmissao: Date,
  ): void {
    this.validateQuantidadeParcelas(parcelamento.quantidadeParcelas);
    this.validateValorTotal(valorTotal);
    this.validateValorMinimoPorParcela(
      valorTotal,
      parcelamento.quantidadeParcelas,
    );

    if (parcelamento.valores) {
      this.validateValoresLength(
        parcelamento.valores,
        parcelamento.quantidadeParcelas,
      );
      this.validateValoresPositivos(parcelamento.valores);
      this.validateSomaValores(parcelamento.valores, valorTotal);
    }

    if (parcelamento.datasVencimento) {
      this.validateDatasVencimentoLength(
        parcelamento.datasVencimento,
        parcelamento.quantidadeParcelas,
      );
      this.validateDatasVencimento(parcelamento.datasVencimento, dataEmissao);
    }
  }

  /**
   * Valida integridade pós-operação: soma das parcelas ativas === valor total.
   * Lança HttpException com status 500 em caso de divergência.
   */
  validateIntegrity(
    parcelas: { valor: number; status: string }[],
    valorTotal: number,
  ): void {
    const parcelasAtivas = parcelas.filter((p) => p.status !== 'CANCELADO');
    const soma =
      Math.round(
        parcelasAtivas.reduce((acc, p) => acc + p.valor, 0) * 100,
      ) / 100;
    const valorTotalArredondado = Math.round(valorTotal * 100) / 100;
    const diferenca = Math.round((soma - valorTotalArredondado) * 100) / 100;

    if (diferenca !== 0) {
      throw new HttpException(
        `Erro de integridade: soma das parcelas (R$ ${soma.toFixed(2)}) diverge do valor total (R$ ${valorTotalArredondado.toFixed(2)}). Diferença: R$ ${Math.abs(diferenca).toFixed(2)}. Transação revertida.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private validateQuantidadeParcelas(quantidadeParcelas: number): void {
    if (quantidadeParcelas < 1 || quantidadeParcelas > 360) {
      throw new HttpException(
        'Quantidade de parcelas deve estar entre 1 e 360',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private validateValorTotal(valorTotal: number): void {
    if (valorTotal <= 0) {
      throw new HttpException(
        'O campo valor deve ser maior que zero',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private validateValorMinimoPorParcela(
    valorTotal: number,
    quantidadeParcelas: number,
  ): void {
    if (valorTotal / quantidadeParcelas < 0.01) {
      throw new HttpException(
        'Valor total insuficiente para a quantidade de parcelas solicitada',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private validateValoresLength(
    valores: number[],
    quantidadeParcelas: number,
  ): void {
    if (valores.length !== quantidadeParcelas) {
      throw new HttpException(
        `Quantidade de valores informados (${valores.length}) diverge da quantidade de parcelas (${quantidadeParcelas})`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private validateValoresPositivos(valores: number[]): void {
    for (let i = 0; i < valores.length; i++) {
      if (valores[i] <= 0) {
        throw new HttpException(
          `Todos os valores de parcela devem ser maiores que zero. Valor inválido na posição ${i + 1}`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  private validateSomaValores(valores: number[], valorTotal: number): void {
    const soma = Math.round(valores.reduce((acc, v) => acc + v, 0) * 100) / 100;
    const valorTotalArredondado = Math.round(valorTotal * 100) / 100;
    const diferenca = Math.round((soma - valorTotalArredondado) * 100) / 100;

    if (diferenca !== 0) {
      throw new HttpException(
        `A soma das parcelas (R$ ${soma.toFixed(2)}) diverge do valor total da conta (R$ ${valorTotalArredondado.toFixed(2)}). Diferença: R$ ${Math.abs(diferenca).toFixed(2)}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private validateDatasVencimentoLength(
    datasVencimento: Date[],
    quantidadeParcelas: number,
  ): void {
    if (datasVencimento.length !== quantidadeParcelas) {
      throw new HttpException(
        `Quantidade de datas informadas (${datasVencimento.length}) diverge da quantidade de parcelas (${quantidadeParcelas})`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private validateDatasVencimento(
    datasVencimento: Date[],
    dataEmissao: Date,
  ): void {
    const emissaoTime = new Date(
      Date.UTC(
        dataEmissao.getUTCFullYear(),
        dataEmissao.getUTCMonth(),
        dataEmissao.getUTCDate(),
      ),
    ).getTime();

    for (let i = 0; i < datasVencimento.length; i++) {
      const vencimento = new Date(datasVencimento[i]);
      const vencimentoTime = new Date(
        Date.UTC(
          vencimento.getUTCFullYear(),
          vencimento.getUTCMonth(),
          vencimento.getUTCDate(),
        ),
      ).getTime();

      if (vencimentoTime < emissaoTime) {
        throw new HttpException(
          `Data de vencimento da parcela ${i + 1} deve ser igual ou posterior à data de emissão`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }
}
