import { IsOptional, IsString, IsNotEmpty, IsIn } from 'class-validator';

export class UpdateUnitOfMeasureDTO {
  @IsOptional()
  @IsString({ message: 'O campo sigla deve ser uma string' })
  @IsNotEmpty({ message: 'O campo sigla não pode ser vazio' })
  sigla?: string;

  @IsOptional()
  @IsString({ message: 'O campo podeFracionar deve ser uma string' })
  @IsIn(['S', 'N'], { message: 'O campo podeFracionar deve ser S ou N' })
  podeFracionar?: string;

  @IsOptional()
  @IsString({ message: 'O campo descricao deve ser uma string' })
  descricao?: string;
}
