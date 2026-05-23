import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class AddressDTO {
  @IsString({ message: 'O campo logradouro deve ser uma string' })
  @IsNotEmpty({ message: 'O campo logradouro é obrigatório' })
  logradouro: string;

  @IsNumber({}, { message: 'O campo numero deve ser um número' })
  numero: number;

  @IsString({ message: 'O campo bairro deve ser uma string' })
  @IsNotEmpty({ message: 'O campo bairro é obrigatório' })
  bairro: string;

  @IsString({ message: 'O campo cidade deve ser uma string' })
  @IsNotEmpty({ message: 'O campo cidade é obrigatório' })
  cidade: string;

  @IsString({ message: 'O campo uf deve ser uma string' })
  @IsNotEmpty({ message: 'O campo uf é obrigatório' })
  uf: string;

  @IsString({ message: 'O campo cep deve ser uma string' })
  @IsNotEmpty({ message: 'O campo cep é obrigatório' })
  cep: string;

  @IsString({ message: 'O campo tipoEndereco deve ser uma string' })
  @IsNotEmpty({ message: 'O campo tipoEndereco é obrigatório' })
  tipoEndereco: string;
}
