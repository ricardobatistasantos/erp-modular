import { IsString, IsNotEmpty } from 'class-validator';

export class FisicaDTO {
  @IsString({ message: 'O campo cpf deve ser uma string' })
  @IsNotEmpty({ message: 'O campo cpf é obrigatório' })
  cpf: string;
}
