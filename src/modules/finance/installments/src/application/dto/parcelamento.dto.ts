import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class ParcelamentoDTO {
  @IsInt({ message: 'quantidadeParcelas deve ser um número inteiro' })
  @IsNotEmpty({ message: 'quantidadeParcelas é obrigatório' })
  @Min(1, { message: 'Quantidade de parcelas deve estar entre 1 e 360' })
  @Max(360, { message: 'Quantidade de parcelas deve estar entre 1 e 360' })
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
