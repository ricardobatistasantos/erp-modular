import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateSubCategoryDTO {
  @IsUUID('4', { message: 'O campo produtoCategoriaId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'O campo produtoCategoriaId é obrigatório' })
  produtoCategoriaId: string;

  @IsString({ message: 'O campo nome deve ser uma string' })
  @IsNotEmpty({ message: 'O campo nome é obrigatório' })
  nome: string;

  @IsOptional()
  @IsString({ message: 'O campo descricao deve ser uma string' })
  descricao?: string;
}
