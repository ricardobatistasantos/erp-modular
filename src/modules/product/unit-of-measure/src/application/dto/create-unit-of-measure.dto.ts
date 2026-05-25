import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class CreateUnitOfMeasureDTO {
  @IsString({ message: 'O campo sigla deve ser uma string' })
  @IsNotEmpty({ message: 'O campo sigla é obrigatório' })
  sigla: string;

  @IsString({ message: 'O campo podeFracionar deve ser uma string' })
  @IsNotEmpty({ message: 'O campo podeFracionar é obrigatório' })
  @IsIn(['S', 'N'], { message: 'O campo podeFracionar deve ser S ou N' })
  podeFracionar: string;

  @IsOptional()
  @IsString({ message: 'O campo descricao deve ser uma string' })
  descricao?: string;
}
