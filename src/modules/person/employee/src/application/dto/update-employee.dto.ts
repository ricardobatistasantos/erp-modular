import { IsOptional, IsString, IsNotEmpty, IsIn, IsNumber, Min, IsArray, IsEmail, IsDateString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AddressDTO } from '@person/shared/dto/address.dto';
import { ContactDTO } from '@person/shared/dto/contact.dto';
import { FisicaDTO } from '@person/shared/dto/fisica.dto';
import { JuridicaDTO } from '@person/shared/dto/juridica.dto';

class UpdateEmployeePessoaDTO {
  @IsOptional()
  @IsString({ message: 'O campo nome deve ser uma string' })
  @IsNotEmpty({ message: 'O campo nome não pode ser vazio' })
  nome?: string;

  @IsOptional()
  @IsEmail({}, { message: 'O campo email deve ser um email válido' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'O campo observacao deve ser uma string' })
  observacao?: string;

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
}

class UpdateCargoDTO {
  @IsString({ message: 'O campo nome do cargo deve ser uma string' })
  @IsNotEmpty({ message: 'O campo nome do cargo é obrigatório' })
  nome: string;

  @IsNumber({}, { message: 'O campo salario deve ser um número' })
  @Min(0, { message: 'O campo salario deve ser maior ou igual a zero' })
  salario: number;
}

class UpdateDepartamentoDTO {
  @IsString({ message: 'O campo nome do departamento deve ser uma string' })
  @IsNotEmpty({ message: 'O campo nome do departamento é obrigatório' })
  nome: string;
}

class UpdateVendedorDTO {
  @IsNumber({}, { message: 'O campo comissao deve ser um número' })
  @Min(0, { message: 'O campo comissao deve ser maior ou igual a zero' })
  comissao: number;

  @IsNumber({}, { message: 'O campo metaVendas deve ser um número' })
  @Min(0, { message: 'O campo metaVendas deve ser maior ou igual a zero' })
  metaVendas: number;
}

class UpdateColaboradorDTO {
  @IsOptional()
  @IsString({ message: 'O campo matricula deve ser uma string' })
  @IsNotEmpty({ message: 'O campo matricula não pode ser vazio' })
  matricula?: string;

  @IsOptional()
  @IsDateString({}, { message: 'O campo dataAdmissao deve ser uma data válida' })
  dataAdmissao?: Date;

  @IsOptional()
  @IsDateString({}, { message: 'O campo dataDemissao deve ser uma data válida' })
  dataDemissao?: Date;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateCargoDTO)
  cargo?: UpdateCargoDTO;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateDepartamentoDTO)
  departamento?: UpdateDepartamentoDTO;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateVendedorDTO)
  vendedor?: UpdateVendedorDTO;
}

export class UpdateEmployeeDTO {
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateEmployeePessoaDTO)
  pessoa?: UpdateEmployeePessoaDTO;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateColaboradorDTO)
  colaborador?: UpdateColaboradorDTO;
}
