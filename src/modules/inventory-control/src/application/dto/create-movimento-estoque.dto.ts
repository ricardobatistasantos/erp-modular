import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { EstoqueTipoMovimento } from '../../domain/enums/estoque-tipo-movimento.enum';
import { EstoqueOrigem } from '../../domain/enums/estoque-origem.enum';

export class CreateMovimentoEstoqueDto {
  @IsUUID()
  @IsNotEmpty({ message: 'produtoId é obrigatório' })
  produtoId: string;

  @IsUUID()
  @IsNotEmpty({ message: 'depositoId é obrigatório' })
  depositoId: string;

  @IsOptional()
  @IsUUID()
  enderecoId?: string;

  @IsOptional()
  @IsUUID()
  loteId?: string;

  @IsEnum(EstoqueTipoMovimento, { message: 'tipo deve ser um EstoqueTipoMovimento válido' })
  @IsNotEmpty({ message: 'tipo é obrigatório' })
  tipo: EstoqueTipoMovimento;

  @IsEnum(EstoqueOrigem, { message: 'origem deve ser uma EstoqueOrigem válida' })
  @IsNotEmpty({ message: 'origem é obrigatória' })
  origem: EstoqueOrigem;

  @IsOptional()
  @IsString()
  origemId?: string;

  @IsNumber({}, { message: 'quantidade deve ser um número' })
  @Min(0.01, { message: 'quantidade deve ser maior que zero' })
  quantidade: number;

  @IsNumber({}, { message: 'custoUnitario deve ser um número' })
  @Min(0, { message: 'custoUnitario não pode ser negativo' })
  custoUnitario: number;

  @IsOptional()
  @IsString()
  observacao?: string;

  @IsOptional()
  @IsUUID()
  usuarioId?: string;
}
