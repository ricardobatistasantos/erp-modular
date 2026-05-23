import { IsBoolean, IsOptional, IsNumber, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePersonDTO } from '@person/shared/dto/create-person.dto';

class ClientDataDTO {
  @IsOptional()
  @IsNumber({}, { message: 'O campo taxaDesconto deve ser um número' })
  @Min(0, { message: 'O campo taxaDesconto deve ser maior ou igual a zero' })
  taxaDesconto?: number;

  @IsOptional()
  @IsNumber({}, { message: 'O campo limiteCredito deve ser um número' })
  @Min(0, { message: 'O campo limiteCredito deve ser maior ou igual a zero' })
  limiteCredito?: number;
}

export class CreateClientDTO {
  @ValidateNested()
  @Type(() => CreatePersonDTO)
  pessoa: CreatePersonDTO;

  @ValidateNested()
  @Type(() => ClientDataDTO)
  cliente: ClientDataDTO;

  @IsBoolean({ message: 'O campo createUser deve ser um booleano' })
  createUser: boolean;
}
