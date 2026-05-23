import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class UpdateBankAgencyDTO {
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
  @IsString({ message: 'O campo contato deve ser uma string' })
  contato?: string;

  @IsOptional()
  @IsString({ message: 'O campo gerente deve ser uma string' })
  gerente?: string;

  @IsOptional()
  @IsString({ message: 'O campo observacao deve ser uma string' })
  observacao?: string;
}
