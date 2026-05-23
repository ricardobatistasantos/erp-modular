import { IsString, IsNotEmpty } from 'class-validator';

export class ContactDTO {
  @IsString({ message: 'O campo tipo deve ser uma string' })
  @IsNotEmpty({ message: 'O campo tipo é obrigatório' })
  tipo: string;

  @IsString({ message: 'O campo telefone deve ser uma string' })
  @IsNotEmpty({ message: 'O campo telefone é obrigatório' })
  telefone: string;
}
