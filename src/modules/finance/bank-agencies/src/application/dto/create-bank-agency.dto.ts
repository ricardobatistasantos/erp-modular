import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateBankAgencyDTO {
  @IsUUID('4', { message: 'O campo bancoId deve ser um UUID válido' })
  bancoId: string;

  @IsString({ message: 'O campo numero deve ser uma string' })
  @IsNotEmpty({ message: 'O campo numero é obrigatório' })
  numero: string;

  @IsString({ message: 'O campo digito deve ser uma string' })
  @IsNotEmpty({ message: 'O campo digito é obrigatório' })
  digito: string;

  @IsString({ message: 'O campo nome deve ser uma string' })
  @IsNotEmpty({ message: 'O campo nome é obrigatório' })
  nome: string;

  @IsOptional()
  @IsString({ message: 'O campo contato deve ser uma string' })
  contato?: string;

  @IsOptional()
  @IsString({ message: 'O campo gerente deve ser uma string' })
  gerente?: string;

  @IsOptional()
  @IsString({ message: 'O campo observacao deve ser uma string' })
  observacao?: string;
}
