import { IsString, IsNotEmpty, IsOptional, IsIn, IsUUID } from 'class-validator';

export class CreateFinancialCategoryDTO {
  @IsString({ message: 'O campo nome deve ser uma string' })
  @IsNotEmpty({ message: 'O campo nome é obrigatório' })
  nome: string;

  @IsString({ message: 'O campo tipo deve ser uma string' })
  @IsNotEmpty({ message: 'O campo tipo é obrigatório' })
  tipo: string;

  @IsOptional()
  @IsString({ message: 'O campo descricao deve ser uma string' })
  descricao?: string;

  @IsOptional()
  @IsUUID('4', { message: 'O campo planoContaId deve ser um UUID válido' })
  planoContaId?: string;
}
