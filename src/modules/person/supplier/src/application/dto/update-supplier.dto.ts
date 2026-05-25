import { IsOptional, IsString, IsNotEmpty, IsIn, IsArray, IsEmail, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AddressDTO } from '@person/shared/dto/address.dto';
import { ContactDTO } from '@person/shared/dto/contact.dto';
import { FisicaDTO } from '@person/shared/dto/fisica.dto';
import { JuridicaDTO } from '@person/shared/dto/juridica.dto';
import { SupplierDataDTO } from './supplier.dto';

class UpdateSupplierPessoaDTO {
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

export class UpdateSupplierDTO {
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateSupplierPessoaDTO)
  pessoa?: UpdateSupplierPessoaDTO;

  @IsOptional()
  @ValidateNested()
  @Type(() => SupplierDataDTO)
  fornecedor?: SupplierDataDTO;
}
