import { IsIn, IsUUID, IsInt, Min, IsDateString, IsNumber } from 'class-validator';

export class CreateInstallmentDTO {
  @IsIn(['PAGAR', 'RECEBER'], { message: 'O campo origem deve ser PAGAR ou RECEBER' })
  origem: 'PAGAR' | 'RECEBER';

  @IsUUID('4', { message: 'O campo origemId deve ser um UUID válido' })
  origemId: string;

  @IsInt({ message: 'O campo numeroParcela deve ser um número inteiro' })
  @Min(1, { message: 'O campo numeroParcela deve ser no mínimo 1' })
  numeroParcela: number;

  @IsInt({ message: 'O campo totalParcelas deve ser um número inteiro' })
  @Min(1, { message: 'O campo totalParcelas deve ser no mínimo 1' })
  totalParcelas: number;

  @IsDateString({}, { message: 'O campo dataVencimento deve ser uma data válida' })
  dataVencimento: Date;

  @IsNumber({}, { message: 'O campo valor deve ser um número' })
  @Min(0.01, { message: 'O campo valor deve ser maior que zero' })
  valor: number;
}
