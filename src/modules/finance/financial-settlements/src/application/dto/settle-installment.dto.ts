export class SettleInstallmentDTO {
  /** ID da parcela a ser baixada */
  parcelaId: string;

  /** Tipo da conta: PAGAR ou RECEBER */
  tipoConta: 'PAGAR' | 'RECEBER';

  /** Valor da baixa (deve ser > 0) */
  valor: number;

  /** Juros aplicados (deve ser >= 0, default: 0) */
  juros?: number;

  /** Multa aplicada (deve ser >= 0, default: 0) */
  multa?: number;

  /** Desconto aplicado (deve ser >= 0, default: 0) */
  desconto?: number;

  /** Data do pagamento/recebimento */
  dataPagamento: Date;

  /** Forma de pagamento utilizada */
  formaPagamento: string;

  /** ID da conta bancária (opcional) */
  contaBancariaId?: string;

  /** ID do caixa (opcional) */
  caixaId?: string;

  /** Observação adicional (opcional) */
  observacao?: string;
}
