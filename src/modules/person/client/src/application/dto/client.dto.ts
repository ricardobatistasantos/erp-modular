import { IsNumber, IsOptional, Min } from "class-validator";

export class ClientDataDTO {
  @IsOptional()
  @IsNumber({}, { message: 'O campo taxaDesconto deve ser um número' })
  @Min(0, { message: 'O campo taxaDesconto deve ser maior ou igual a zero' })
  taxaDesconto?: number;

  @IsOptional()
  @IsNumber({}, { message: 'O campo limiteCredito deve ser um número' })
  @Min(0, { message: 'O campo limiteCredito deve ser maior ou igual a zero' })
  limiteCredito?: number;
}