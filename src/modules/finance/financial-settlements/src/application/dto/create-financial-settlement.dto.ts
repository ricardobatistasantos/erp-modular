import { IsString, IsNotEmpty, IsOptional, IsIn, IsUUID, IsDateString, IsNumber, Min } from 'class-validator';

export class CreateFinancialSettlementDTO {
  @IsIn(['RECEBER', 'PAGAR'], { message: 'O campo tipoConta deve ser RECEBER ou PAGAR' })
  tipoConta: 'RECEBER' | 'PAGAR';

  @IsUUID('4', { message: 'O campo contaId deve ser um UUID válido' })
  contaId: string;

  @IsNumber({}, { message: 'O campo valor deve ser um número' })
  @Min(0.01, { message: 'O campo valor deve ser maior que zero' })
  valor: number;

  @IsDateString({}, { message: 'O campo dataPagamento deve ser uma data válida' })
  dataPagamento: Date;

  @IsString({ message: 'O campo formaPagamento deve ser uma string' })
  @IsNotEmpty({ message: 'O campo formaPagamento é obrigatório' })
  formaPagamento: string;

  @IsOptional()
  @IsUUID('4', { message: 'O campo contaBancariaId deve ser um UUID válido' })
  contaBancariaId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'O campo caixaId deve ser um UUID válido' })
  caixaId?: string;

  @IsOptional()
  @IsString({ message: 'O campo observacao deve ser uma string' })
  observacao?: string;
}
