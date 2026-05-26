import { IsNotEmpty, IsUUID } from 'class-validator';

export class ReceberTransferenciaDto {
  @IsUUID()
  @IsNotEmpty({ message: 'transferenciaId é obrigatório' })
  transferenciaId: string;
}
