import { IsOptional, IsString, IsNotEmpty, IsBoolean } from 'class-validator';

export class UpdatePaymentMethodDTO {
  @IsOptional()
  @IsString({ message: 'O campo nome deve ser uma string' })
  @IsNotEmpty({ message: 'O campo nome não pode ser vazio' })
  nome?: string;

  @IsOptional()
  @IsString({ message: 'O campo descricao deve ser uma string' })
  descricao?: string;

  @IsOptional()
  @IsBoolean({ message: 'O campo ativo deve ser um booleano' })
  ativo?: boolean;
}
