import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';

export class GenerateInstallmentsDTO {
  @IsIn(['PAGAR', 'RECEBER'])
  @IsNotEmpty()
  tipoConta: 'PAGAR' | 'RECEBER';

  @IsUUID()
  @IsNotEmpty()
  contaId: string;

  @IsNumber()
  @Min(1, { message: 'Quantidade de parcelas deve ser maior que zero' })
  quantidadeParcelas: number;

  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Intervalo de meses deve ser maior que zero' })
  intervaloMeses?: number;
}
