import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class ContagemItemDto {
  @IsUUID()
  @IsNotEmpty({ message: 'produtoId é obrigatório' })
  produtoId: string;

  @IsNumber({}, { message: 'saldoFisico deve ser um número' })
  @Min(0, { message: 'saldoFisico não pode ser negativo' })
  saldoFisico: number;
}

export class RegistrarContagemDto {
  @IsUUID()
  @IsNotEmpty({ message: 'inventarioId é obrigatório' })
  inventarioId: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'itens deve conter ao menos um item' })
  @ValidateNested({ each: true })
  @Type(() => ContagemItemDto)
  itens: ContagemItemDto[];
}
