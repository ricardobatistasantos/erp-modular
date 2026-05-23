import { IsOptional, IsString, IsNotEmpty, IsIn, IsBoolean, IsUUID } from 'class-validator';

export class UpdateChartOfAccountsDTO {
  @IsOptional()
  @IsString({ message: 'O campo codigo deve ser uma string' })
  @IsNotEmpty({ message: 'O campo codigo não pode ser vazio' })
  codigo?: string;

  @IsOptional()
  @IsString({ message: 'O campo nome deve ser uma string' })
  @IsNotEmpty({ message: 'O campo nome não pode ser vazio' })
  nome?: string;

  @IsOptional()
  @IsIn(['SINTETICA', 'ANALITICA'], { message: 'O campo tipo deve ser SINTETICA ou ANALITICA' })
  tipo?: 'SINTETICA' | 'ANALITICA';

  @IsOptional()
  @IsIn(['RECEITA', 'DESPESA', 'ATIVO', 'PASSIVO', 'PATRIMONIO'], { message: 'O campo natureza deve ser RECEITA, DESPESA, ATIVO, PASSIVO ou PATRIMONIO' })
  natureza?: 'RECEITA' | 'DESPESA' | 'ATIVO' | 'PASSIVO' | 'PATRIMONIO';

  @IsOptional()
  @IsUUID('4', { message: 'O campo contaPaiId deve ser um UUID válido' })
  contaPaiId?: string;

  @IsOptional()
  @IsBoolean({ message: 'O campo aceitaLancamento deve ser um booleano' })
  aceitaLancamento?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'O campo ativo deve ser um booleano' })
  ativo?: boolean;
}
