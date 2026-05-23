import { IsUUID } from 'class-validator';

export class CancelInstallmentDTO {
  @IsUUID('4', { message: 'O campo parcelaId deve ser um UUID válido' })
  parcelaId: string;
}
