import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateCostCenterDTO {
  @IsString({ message: 'O campo codigo deve ser uma string' })
  @IsNotEmpty({ message: 'O campo codigo é obrigatório' })
  codigo: string;

  @IsString({ message: 'O campo nome deve ser uma string' })
  @IsNotEmpty({ message: 'O campo nome é obrigatório' })
  nome: string;

  @IsOptional()
  @IsString({ message: 'O campo descricao deve ser uma string' })
  descricao?: string;

  @IsOptional()
  @IsUUID('4', { message: 'O campo centroPaiId deve ser um UUID válido' })
  centroPaiId?: string;
}
