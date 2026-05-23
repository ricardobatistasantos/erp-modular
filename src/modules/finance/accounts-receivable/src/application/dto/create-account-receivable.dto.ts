import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ParcelamentoDTO } from '../../../../installments/src/application/dto/parcelamento.dto';

export class CreateAccountReceivableDTO {
  @IsUUID()
  @IsNotEmpty({ message: 'pessoaId é obrigatório' })
  pessoaId: string;

  @IsString()
  @IsNotEmpty({ message: 'numeroDocumento é obrigatório' })
  numeroDocumento: string;

  @IsString()
  @IsNotEmpty({ message: 'descricao é obrigatória' })
  descricao: string;

  @IsUUID()
  @IsNotEmpty({ message: 'categoriaFinanceiraId é obrigatório' })
  categoriaFinanceiraId: string;

  @IsDateString({}, { message: 'dataEmissao deve ser uma data válida' })
  @IsNotEmpty({ message: 'dataEmissao é obrigatória' })
  dataEmissao: Date;

  @IsDateString({}, { message: 'dataVencimento deve ser uma data válida' })
  @IsNotEmpty({ message: 'dataVencimento é obrigatória' })
  dataVencimento: Date;

  @IsNumber({}, { message: 'valor deve ser um número' })
  @Min(0.01, { message: 'O campo valor deve ser maior que zero' })
  valor: number;

  @IsOptional()
  @IsUUID()
  centroCustoId?: string;

  @IsOptional()
  @IsUUID()
  contaBancariaId?: string;

  @IsOptional()
  @IsString()
  formaPagamento?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ParcelamentoDTO)
  parcelamento?: ParcelamentoDTO;
}
