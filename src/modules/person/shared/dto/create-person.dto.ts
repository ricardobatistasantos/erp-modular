import { IsString, IsNotEmpty, IsOptional, IsIn, IsArray, IsDateString, ValidateNested, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';
import { AddressDTO } from './address.dto';
import { ContactDTO } from './contact.dto';
import { FisicaDTO } from './fisica.dto';
import { JuridicaDTO } from './juridica.dto';

export class CreatePersonDTO {
  @IsString({ message: 'O campo nome deve ser uma string' })
  @IsNotEmpty({ message: 'O campo nome é obrigatório' })
  nome: string;

  @IsOptional()
  @IsEmail({}, { message: 'O campo email deve ser um email válido' })
  email?: string;

  @IsIn(['F', 'J'], { message: 'O campo tipo deve ser F (Física) ou J (Jurídica)' })
  tipo: 'F' | 'J';

  @IsOptional()
  @ValidateNested()
  @Type(() => FisicaDTO)
  fisica?: FisicaDTO;

  @IsOptional()
  @ValidateNested()
  @Type(() => JuridicaDTO)
  juridica?: JuridicaDTO;

  @IsOptional()
  @IsArray({ message: 'O campo contatos deve ser um array' })
  @ValidateNested({ each: true })
  @Type(() => ContactDTO)
  contatos?: ContactDTO[];

  @IsOptional()
  @IsArray({ message: 'O campo enderecos deve ser um array' })
  @ValidateNested({ each: true })
  @Type(() => AddressDTO)
  enderecos?: AddressDTO[];

  @IsOptional()
  @IsDateString({}, { message: 'O campo cadastro deve ser uma data válida' })
  cadastro?: Date;

  @IsOptional()
  @IsString({ message: 'O campo observacao deve ser uma string' })
  observacao?: string;
}
