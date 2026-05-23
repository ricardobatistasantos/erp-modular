import { IsOptional, IsString, IsNotEmpty, IsUUID, IsBoolean } from 'class-validator';

export class UpdateFinancialCategoryDTO {
  @IsOptional()
  @IsString({ message: 'O campo nome deve ser uma string' })
  @IsNotEmpty({ message: 'O campo nome não pode ser vazio' })
  nome?: string;

  @IsOptional()
  @IsString({ message: 'O campo tipo deve ser uma string' })
  @IsNotEmpty({ message: 'O campo tipo não pode ser vazio' })
  tipo?: string;

  @IsOptional()
  @IsString({ message: 'O campo descricao deve ser uma string' })
  descricao?: string;

  @IsOptional()
  @IsUUID('4', { message: 'O campo planoContaId deve ser um UUID válido' })
  planoContaId?: string;

  @IsOptional()
  @IsBoolean({ message: 'O campo ativo deve ser um booleano' })
  ativo?: boolean;
}
