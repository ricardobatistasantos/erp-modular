import { IsOptional, IsString, IsNotEmpty, IsUUID, IsBoolean } from 'class-validator';

export class UpdateCostCenterDTO {
  @IsOptional()
  @IsString({ message: 'O campo codigo deve ser uma string' })
  @IsNotEmpty({ message: 'O campo codigo não pode ser vazio' })
  codigo?: string;

  @IsOptional()
  @IsString({ message: 'O campo nome deve ser uma string' })
  @IsNotEmpty({ message: 'O campo nome não pode ser vazio' })
  nome?: string;

  @IsOptional()
  @IsString({ message: 'O campo descricao deve ser uma string' })
  descricao?: string;

  @IsOptional()
  @IsUUID('4', { message: 'O campo centroPaiId deve ser um UUID válido' })
  centroPaiId?: string;

  @IsOptional()
  @IsBoolean({ message: 'O campo ativo deve ser um booleano' })
  ativo?: boolean;
}
