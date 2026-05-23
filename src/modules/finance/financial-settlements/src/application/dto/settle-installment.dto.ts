import { IsString, IsNotEmpty, IsOptional, IsIn, IsUUID, IsDateString, IsNumber, Min } from 'class-validator';

export class SettleInstallmentDTO {
  /** ID da parcela a ser baixada */
  @IsUUID('4', { message: 'O campo parcelaId deve ser um UUID válido' })
  parcelaId: string;

  /** Tipo da conta: PAGAR ou RECEBER */
  @IsIn(['PAGAR', 'RECEBER'], { message: 'O campo tipoConta deve ser PAGAR ou RECEBER' })
  tipoConta: 'PAGAR' | 'RECEBER';

  /** Valor da baixa (deve ser > 0) */
  @IsNumber({}, { message: 'O campo valor deve ser um número' })
  @Min(0.01, { message: 'O campo valor deve ser maior que zero' })
  valor: number;

  /** Juros aplicados (deve ser >= 0, default: 0) */
  @IsOptional()
  @IsNumber({}, { message: 'O campo juros deve ser um número' })
  @Min(0, { message: 'O campo juros deve ser maior ou igual a zero' })
  juros?: number;

  /** Multa aplicada (deve ser >= 0, default: 0) */
  @IsOptional()
  @IsNumber({}, { message: 'O campo multa deve ser um número' })
  @Min(0, { message: 'O campo multa deve ser maior ou igual a zero' })
  multa?: number;

  /** Desconto aplicado (deve ser >= 0, default: 0) */
  @IsOptional()
  @IsNumber({}, { message: 'O campo desconto deve ser um número' })
  @Min(0, { message: 'O campo desconto deve ser maior ou igual a zero' })
  desconto?: number;

  /** Data do pagamento/recebimento */
  @IsDateString({}, { message: 'O campo dataPagamento deve ser uma data válida' })
  dataPagamento: Date;

  /** Forma de pagamento utilizada */
  @IsString({ message: 'O campo formaPagamento deve ser uma string' })
  @IsNotEmpty({ message: 'O campo formaPagamento é obrigatório' })
  formaPagamento: string;

  /** ID da conta bancária (opcional) */
  @IsOptional()
  @IsUUID('4', { message: 'O campo contaBancariaId deve ser um UUID válido' })
  contaBancariaId?: string;

  /** ID do caixa (opcional) */
  @IsOptional()
  @IsUUID('4', { message: 'O campo caixaId deve ser um UUID válido' })
  caixaId?: string;

  /** Observação adicional (opcional) */
  @IsOptional()
  @IsString({ message: 'O campo observacao deve ser uma string' })
  observacao?: string;
}
