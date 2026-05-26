import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateInventarioDto {
  @IsUUID()
  @IsNotEmpty({ message: 'depositoId é obrigatório' })
  depositoId: string;
}
