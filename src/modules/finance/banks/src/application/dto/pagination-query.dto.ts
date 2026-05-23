import { IsOptional, IsInt, Min, Max } from 'class-validator';

export class PaginationQueryDTO {
  @IsOptional()
  @IsInt({ message: 'O campo page deve ser um número inteiro' })
  @Min(1, { message: 'O campo page deve ser no mínimo 1' })
  page?: number = 1;

  @IsOptional()
  @IsInt({ message: 'O campo limit deve ser um número inteiro' })
  @Min(1, { message: 'O campo limit deve ser no mínimo 1' })
  @Max(100, { message: 'O campo limit deve ser no máximo 100' })
  limit?: number = 10;
}
