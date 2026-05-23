import { IsIn, IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';

export class RecalculateInstallmentsDTO {
  @IsUUID(undefined, { message: 'contaId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'contaId é obrigatório' })
  contaId: string;

  @IsIn(['PAGAR', 'RECEBER'], { message: 'tipoConta deve ser PAGAR ou RECEBER' })
  @IsNotEmpty({ message: 'tipoConta é obrigatório' })
  tipoConta: 'PAGAR' | 'RECEBER';

  @IsNumber({}, { message: 'novoValorTotal deve ser um número' })
  @Min(0.01, { message: 'O novo valor total deve ser maior que zero' })
  novoValorTotal: number;
}
