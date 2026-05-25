import { IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePersonDTO } from '@person/shared/dto/create-person.dto';
import { ClientDataDTO } from './client.dto';

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
