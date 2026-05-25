import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

export class SupplierDataDTO {
  @IsOptional()
  @IsString({ message: 'O campo categoria deve ser uma string' })
  @MaxLength(100, { message: 'O campo categoria deve ter no máximo 100 caracteres' })
  categoria?: string;

  @IsOptional()
  @IsInt({ message: 'O campo prazoEntregaDias deve ser um número inteiro' })
  @Min(0, { message: 'O campo prazoEntregaDias deve ser no mínimo 0' })
  @Max(365, { message: 'O campo prazoEntregaDias deve ser no máximo 365' })
  prazoEntregaDias?: number;
}
