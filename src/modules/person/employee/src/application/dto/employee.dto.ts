import { IsString, IsNotEmpty, IsOptional, IsDateString, IsNumber, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CargoDTO {
  @IsString({ message: 'O campo nome do cargo deve ser uma string' })
  @IsNotEmpty({ message: 'O campo nome do cargo é obrigatório' })
  nome: string;

  @IsNumber({}, { message: 'O campo salario deve ser um número' })
  @Min(0, { message: 'O campo salario deve ser maior ou igual a zero' })
  salario: number;
}

class DepartamentoDTO {
  @IsString({ message: 'O campo nome do departamento deve ser uma string' })
  @IsNotEmpty({ message: 'O campo nome do departamento é obrigatório' })
  nome: string;
}

class VendedorDTO {
  @IsNumber({}, { message: 'O campo comissao deve ser um número' })
  @Min(0, { message: 'O campo comissao deve ser maior ou igual a zero' })
  comissao: number;

  @IsNumber({}, { message: 'O campo metaVendas deve ser um número' })
  @Min(0, { message: 'O campo metaVendas deve ser maior ou igual a zero' })
  metaVendas: number;
}

export class EmployeeDTO {
  @IsString({ message: 'O campo matricula deve ser uma string' })
  @IsNotEmpty({ message: 'O campo matricula é obrigatório' })
  matricula: string;

  @IsOptional()
  @IsDateString({}, { message: 'O campo dataAdmissao deve ser uma data válida' })
  dataAdmissao?: Date;

  @IsOptional()
  @IsDateString({}, { message: 'O campo dataDemissao deve ser uma data válida' })
  dataDemissao?: Date;

  @ValidateNested()
  @Type(() => CargoDTO)
  cargo: CargoDTO;

  @ValidateNested()
  @Type(() => DepartamentoDTO)
  departamento: DepartamentoDTO;

  @IsOptional()
  @ValidateNested()
  @Type(() => VendedorDTO)
  vendedor?: VendedorDTO;
}
