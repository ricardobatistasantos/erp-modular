import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class UpdateCategoryDTO {
  @IsOptional()
  @IsString({ message: 'O campo nome deve ser uma string' })
  @IsNotEmpty({ message: 'O campo nome não pode ser vazio' })
  nome?: string;

  @IsOptional()
  @IsString({ message: 'O campo descricao deve ser uma string' })
  descricao?: string;
}
