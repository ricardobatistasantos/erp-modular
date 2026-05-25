import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCategoryDTO {
  @IsString({ message: 'O campo nome deve ser uma string' })
  @IsNotEmpty({ message: 'O campo nome é obrigatório' })
  nome: string;

  @IsOptional()
  @IsString({ message: 'O campo descricao deve ser uma string' })
  descricao?: string;
}
