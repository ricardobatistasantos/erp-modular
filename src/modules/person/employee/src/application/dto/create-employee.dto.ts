import { IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePersonDTO } from '@person/shared/dto/create-person.dto';
import { EmployeeDTO } from './employee.dto';

export class CreateEmployeeDTO {
  @ValidateNested()
  @Type(() => CreatePersonDTO)
  pessoa: CreatePersonDTO;

  @ValidateNested()
  @Type(() => EmployeeDTO)
  colaborador: EmployeeDTO;

  @IsBoolean({ message: 'O campo createUser deve ser um booleano' })
  createUser: boolean;
}
