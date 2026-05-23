import { IsOptional, IsString, IsNotEmpty, IsUUID, IsDateString, IsNumber, Min } from 'class-validator';

export class UpdateAccountPayableDTO {
  @IsOptional()
  @IsString({ message: 'O campo numeroDocumento deve ser uma string' })
  @IsNotEmpty({ message: 'O campo numeroDocumento não pode ser vazio' })
  numeroDocumento?: string;

  @IsOptional()
  @IsString({ message: 'O campo descricao deve ser uma string' })
  @IsNotEmpty({ message: 'O campo descricao não pode ser vazio' })
  descricao?: string;

  @IsOptional()
  @IsUUID('4', { message: 'O campo categoriaFinanceiraId deve ser um UUID válido' })
  categoriaFinanceiraId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'O campo centroCustoId deve ser um UUID válido' })
  centroCustoId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'O campo contaBancariaId deve ser um UUID válido' })
  contaBancariaId?: string;

  @IsOptional()
  @IsDateString({}, { message: 'O campo dataEmissao deve ser uma data válida' })
  dataEmissao?: Date;

  @IsOptional()
  @IsDateString({}, { message: 'O campo dataVencimento deve ser uma data válida' })
  dataVencimento?: Date;

  @IsOptional()
  @IsNumber({}, { message: 'O campo valor deve ser um número' })
  @Min(0.01, { message: 'O campo valor deve ser maior que zero' })
  valor?: number;

  @IsOptional()
  @IsString({ message: 'O campo formaPagamento deve ser uma string' })
  @IsNotEmpty({ message: 'O campo formaPagamento não pode ser vazio' })
  formaPagamento?: string;
}
