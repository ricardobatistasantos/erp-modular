import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TransferenciaItemDto {
  @IsUUID()
  @IsNotEmpty({ message: 'produtoId é obrigatório' })
  produtoId: string;

  @IsNumber({}, { message: 'quantidade deve ser um número' })
  @Min(0.01, { message: 'quantidade deve ser maior que zero' })
  quantidade: number;
}

export class CreateTransferenciaDto {
  @IsUUID()
  @IsNotEmpty({ message: 'depositoOrigemId é obrigatório' })
  depositoOrigemId: string;

  @IsUUID()
  @IsNotEmpty({ message: 'depositoDestinoId é obrigatório' })
  depositoDestinoId: string;

  @IsOptional()
  @IsString()
  observacao?: string;

  @IsArray({ message: 'itens deve ser um array' })
  @ArrayMinSize(1, { message: 'itens deve conter ao menos 1 item' })
  @ValidateNested({ each: true })
  @Type(() => TransferenciaItemDto)
  itens: TransferenciaItemDto[];
}
