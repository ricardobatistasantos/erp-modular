import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreateBankDTO {
  @IsString({ message: 'O campo codigo deve ser uma string' })
  @IsNotEmpty({ message: 'O campo codigo é obrigatório' })
  codigo: string;

  @IsString({ message: 'O campo nome deve ser uma string' })
  @IsNotEmpty({ message: 'O campo nome é obrigatório' })
  nome: string;

  @IsOptional()
  @IsString({ message: 'O campo urlSite deve ser uma string' })
  urlSite?: string;
}
