import { IsString, IsNotEmpty, IsIn, IsOptional, IsBoolean, IsUUID } from 'class-validator';

export class CreateChartOfAccountsDTO {
  @IsString({ message: 'O campo codigo deve ser uma string' })
  @IsNotEmpty({ message: 'O campo codigo é obrigatório' })
  codigo: string;

  @IsString({ message: 'O campo nome deve ser uma string' })
  @IsNotEmpty({ message: 'O campo nome é obrigatório' })
  nome: string;

  @IsIn(['SINTETICA', 'ANALITICA'], { message: 'O campo tipo deve ser SINTETICA ou ANALITICA' })
  tipo: 'SINTETICA' | 'ANALITICA';

  @IsIn(['RECEITA', 'DESPESA', 'ATIVO', 'PASSIVO', 'PATRIMONIO'], { message: 'O campo natureza deve ser RECEITA, DESPESA, ATIVO, PASSIVO ou PATRIMONIO' })
  natureza: 'RECEITA' | 'DESPESA' | 'ATIVO' | 'PASSIVO' | 'PATRIMONIO';

  @IsOptional()
  @IsUUID('4', { message: 'O campo contaPaiId deve ser um UUID válido' })
  contaPaiId?: string;

  @IsBoolean({ message: 'O campo aceitaLancamento deve ser um booleano' })
  aceitaLancamento: boolean;
}
