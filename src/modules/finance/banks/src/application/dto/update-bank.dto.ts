import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class UpdateBankDTO {
  @IsOptional()
  @IsString({ message: 'O campo codigo deve ser uma string' })
  @IsNotEmpty({ message: 'O campo codigo não pode ser vazio' })
  codigo?: string;

  @IsOptional()
  @IsString({ message: 'O campo nome deve ser uma string' })
  @IsNotEmpty({ message: 'O campo nome não pode ser vazio' })
  nome?: string;

  @IsOptional()
  @IsString({ message: 'O campo urlSite deve ser uma string' })
  urlSite?: string;
}
