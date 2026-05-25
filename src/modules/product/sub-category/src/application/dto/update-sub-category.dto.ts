import { IsOptional, IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateSubCategoryDTO {
  @IsOptional()
  @IsUUID('4', { message: 'O campo produtoCategoriaId deve ser um UUID válido' })
  produtoCategoriaId?: string;

  @IsOptional()
  @IsString({ message: 'O campo nome deve ser uma string' })
  @IsNotEmpty({ message: 'O campo nome não pode ser vazio' })
  nome?: string;

  @IsOptional()
  @IsString({ message: 'O campo descricao deve ser uma string' })
  descricao?: string;
}
