import { IsString, IsNotEmpty } from 'class-validator';

export class JuridicaDTO {
  @IsString({ message: 'O campo cnpj deve ser uma string' })
  @IsNotEmpty({ message: 'O campo cnpj é obrigatório' })
  cnpj: string;
}
