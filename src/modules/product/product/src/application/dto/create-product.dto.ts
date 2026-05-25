import { IsString, IsNotEmpty, IsOptional, IsUUID, IsNumber, IsPositive, IsDateString } from 'class-validator';

export class CreateProductDTO {
  @IsUUID('4', { message: 'O campo produtoSubCategoriaId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'O campo produtoSubCategoriaId é obrigatório' })
  produtoSubCategoriaId: string;

  @IsUUID('4', { message: 'O campo produtoUnidadeMedidaId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'O campo produtoUnidadeMedidaId é obrigatório' })
  produtoUnidadeMedidaId: string;

  @IsUUID('4', { message: 'O campo produtoMarcaId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'O campo produtoMarcaId é obrigatório' })
  produtoMarcaId: string;

  @IsString({ message: 'O campo nome deve ser uma string' })
  @IsNotEmpty({ message: 'O campo nome é obrigatório' })
  nome: string;

  @IsOptional()
  @IsString({ message: 'O campo gtin deve ser uma string' })
  gtin?: string;

  @IsOptional()
  @IsString({ message: 'O campo codigoInterno deve ser uma string' })
  codigoInterno?: string;

  @IsNumber({}, { message: 'O campo valorCompra deve ser um número' })
  @IsPositive({ message: 'O campo valorCompra deve ser maior que zero' })
  valorCompra: number;

  @IsNumber({}, { message: 'O campo valorVenda deve ser um número' })
  @IsPositive({ message: 'O campo valorVenda deve ser maior que zero' })
  valorVenda: number;

  @IsNumber({}, { message: 'O campo quantidadeEstoque deve ser um número' })
  quantidadeEstoque: number;

  @IsDateString({}, { message: 'O campo cadastro deve ser uma data válida' })
  @IsNotEmpty({ message: 'O campo cadastro é obrigatório' })
  cadastro: string;

  @IsOptional()
  @IsString({ message: 'O campo descricao deve ser uma string' })
  descricao?: string;
}
