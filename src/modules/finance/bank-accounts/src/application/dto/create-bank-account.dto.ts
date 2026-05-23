import { IsString, IsNotEmpty, IsOptional, IsIn, IsUUID } from 'class-validator';

export class CreateBankAccountDTO {
  @IsUUID('4', { message: 'O campo bancoAgenciaId deve ser um UUID válido' })
  bancoAgenciaId: string;

  @IsString({ message: 'O campo numero deve ser uma string' })
  @IsNotEmpty({ message: 'O campo numero é obrigatório' })
  numero: string;

  @IsString({ message: 'O campo digito deve ser uma string' })
  @IsNotEmpty({ message: 'O campo digito é obrigatório' })
  digito: string;

  @IsString({ message: 'O campo nome deve ser uma string' })
  @IsNotEmpty({ message: 'O campo nome é obrigatório' })
  nome: string;

  @IsIn(['I', 'P', 'C'], { message: 'O campo tipo deve ser I (Investimento), P (Poupança) ou C (Corrente)' })
  tipo: string;

  @IsOptional()
  @IsString({ message: 'O campo descricao deve ser uma string' })
  descricao?: string;
}
