import { CreatePersonDTO } from "@person/shared/dto/create-person.dto";

export class CreateClientDTO {
  pessoa: CreatePersonDTO;

  cliente: {
    taxaDesconto?: number;
    limiteCredito?: number;
  };
}