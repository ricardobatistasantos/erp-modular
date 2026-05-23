import { IsOptional, IsString, IsNotEmpty, IsIn } from 'class-validator';

export class UpdateBankAccountDTO {
  @IsOptional()
  @IsString({ message: 'O campo numero deve ser uma string' })
  @IsNotEmpty({ message: 'O campo numero não pode ser vazio' })
  numero?: string;

  @IsOptional()
  @IsString({ message: 'O campo digito deve ser uma string' })
  @IsNotEmpty({ message: 'O campo digito não pode ser vazio' })
  digito?: string;

  @IsOptional()
  @IsString({ message: 'O campo nome deve ser uma string' })
  @IsNotEmpty({ message: 'O campo nome não pode ser vazio' })
  nome?: string;

  @IsOptional()
  @IsIn(['I', 'P', 'C'], { message: 'O campo tipo deve ser I (Investimento), P (Poupança) ou C (Corrente)' })
  tipo?: string;

  @IsOptional()
  @IsString({ message: 'O campo descricao deve ser uma string' })
  descricao?: string;
}
