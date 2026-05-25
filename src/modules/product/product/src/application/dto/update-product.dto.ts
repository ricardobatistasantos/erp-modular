import { IsString, IsNotEmpty, IsOptional, IsUUID, IsNumber, IsPositive, IsDateString } from 'class-validator';

export class UpdateProductDTO {
  @IsOptional()
  @IsUUID('4', { message: 'O campo produtoSubCategoriaId deve ser um UUID válido' })
  produtoSubCategoriaId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'O campo produtoUnidadeMedidaId deve ser um UUID válido' })
  produtoUnidadeMedidaId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'O campo produtoMarcaId deve ser um UUID válido' })
  produtoMarcaId?: string;

  @IsOptional()
  @IsString({ message: 'O campo nome deve ser uma string' })
  @IsNotEmpty({ message: 'O campo nome não pode ser vazio' })
  nome?: string;

  @IsOptional()
  @IsString({ message: 'O campo gtin deve ser uma string' })
  gtin?: string;

  @IsOptional()
  @IsString({ message: 'O campo codigoInterno deve ser uma string' })
  codigoInterno?: string;

  @IsOptional()
  @IsNumber({}, { message: 'O campo valorCompra deve ser um número' })
  @IsPositive({ message: 'O campo valorCompra deve ser maior que zero' })
  valorCompra?: number;

  @IsOptional()
  @IsNumber({}, { message: 'O campo valorVenda deve ser um número' })
  @IsPositive({ message: 'O campo valorVenda deve ser maior que zero' })
  valorVenda?: number;

  @IsOptional()
  @IsNumber({}, { message: 'O campo quantidadeEstoque deve ser um número' })
  quantidadeEstoque?: number;

  @IsOptional()
  @IsDateString({}, { message: 'O campo cadastro deve ser uma data válida' })
  cadastro?: string;

  @IsOptional()
  @IsString({ message: 'O campo descricao deve ser uma string' })
  descricao?: string;
}
