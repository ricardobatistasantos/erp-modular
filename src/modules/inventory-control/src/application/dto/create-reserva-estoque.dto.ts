import { IsEnum, IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';
import { EstoqueOrigem } from '../../domain/enums/estoque-origem.enum';

export class CreateReservaEstoqueDto {
  @IsUUID()
  @IsNotEmpty({ message: 'produtoId é obrigatório' })
  produtoId: string;

  @IsUUID()
  @IsNotEmpty({ message: 'depositoId é obrigatório' })
  depositoId: string;

  @IsEnum(EstoqueOrigem, { message: 'origem deve ser uma EstoqueOrigem válida' })
  @IsNotEmpty({ message: 'origem é obrigatória' })
  origem: EstoqueOrigem;

  @IsNotEmpty({ message: 'origemId é obrigatório' })
  @IsUUID()
  origemId: string;

  @IsNumber({}, { message: 'quantidade deve ser um número' })
  @Min(0.01, { message: 'quantidade deve ser maior que zero' })
  quantidade: number;
}
