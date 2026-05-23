import { IsString, IsNotEmpty, IsOptional, IsIn, IsUUID, IsDateString, IsNumber, Min } from 'class-validator';

export class CreateFinancialEntryDTO {
  @IsIn(['RECEITA', 'DESPESA'], { message: 'O campo tipo deve ser RECEITA ou DESPESA' })
  tipo: 'RECEITA' | 'DESPESA';

  @IsString({ message: 'O campo origem deve ser uma string' })
  @IsNotEmpty({ message: 'O campo origem é obrigatório' })
  origem: string;

  @IsUUID('4', { message: 'O campo origemId deve ser um UUID válido' })
  origemId: string;

  @IsUUID('4', { message: 'O campo planoContaId deve ser um UUID válido' })
  planoContaId: string;

  @IsDateString({}, { message: 'O campo dataLancamento deve ser uma data válida' })
  dataLancamento: Date;

  @IsString({ message: 'O campo descricao deve ser uma string' })
  @IsNotEmpty({ message: 'O campo descricao é obrigatório' })
  descricao: string;

  @IsNumber({}, { message: 'O campo valor deve ser um número' })
  @Min(0.01, { message: 'O campo valor deve ser maior que zero' })
  valor: number;

  @IsOptional()
  @IsUUID('4', { message: 'O campo centroCustoId deve ser um UUID válido' })
  centroCustoId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'O campo contaBancariaId deve ser um UUID válido' })
  contaBancariaId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'O campo caixaId deve ser um UUID válido' })
  caixaId?: string;
}
