import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class RegenerateInstallmentsDTO {
  @IsUUID(undefined, { message: 'contaId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'contaId é obrigatório' })
  contaId: string;

  @IsIn(['PAGAR', 'RECEBER'], { message: 'tipoConta deve ser PAGAR ou RECEBER' })
  @IsNotEmpty({ message: 'tipoConta é obrigatório' })
  tipoConta: 'PAGAR' | 'RECEBER';

  @IsInt({ message: 'quantidadeParcelas deve ser um número inteiro' })
  @Min(1, { message: 'Quantidade de parcelas deve ser no mínimo 1' })
  @Max(360, { message: 'Quantidade de parcelas deve ser no máximo 360' })
  quantidadeParcelas: number;

  @IsOptional()
  @IsInt({ message: 'intervaloMeses deve ser um número inteiro' })
  @Min(1, { message: 'Intervalo de meses deve ser maior que zero' })
  intervaloMeses?: number;

  @IsOptional()
  @IsArray({ message: 'valores deve ser um array' })
  @ArrayMinSize(1, { message: 'valores deve conter ao menos 1 item' })
  @IsNumber({}, { each: true, message: 'Cada valor deve ser um número' })
  valores?: number[];

  @IsOptional()
  @IsArray({ message: 'datasVencimento deve ser um array' })
  @ArrayMinSize(1, { message: 'datasVencimento deve conter ao menos 1 item' })
  @IsDateString({}, { each: true, message: 'Cada data de vencimento deve ser uma data válida (ISO 8601)' })
  datasVencimento?: Date[];
}
