import { IsNotEmpty, IsUUID } from 'class-validator';

export class FinalizarInventarioDto {
  @IsUUID()
  @IsNotEmpty({ message: 'inventarioId é obrigatório' })
  inventarioId: string;
}
