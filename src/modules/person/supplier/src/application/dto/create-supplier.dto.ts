import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePersonDTO } from '@person/shared/dto/create-person.dto';
import { SupplierDataDTO } from './supplier.dto';

export class CreateSupplierDTO {
  @ValidateNested()
  @Type(() => CreatePersonDTO)
  pessoa: CreatePersonDTO;

  @ValidateNested()
  @Type(() => SupplierDataDTO)
  fornecedor: SupplierDataDTO;
}
