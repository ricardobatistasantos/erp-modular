import { AddressDTO } from "./address.dto";
import { ContactDTO } from "./contact.dto";
import { FisicaDTO } from "./fisica.dto";
import { JuridicaDTO } from "./juridica.dto";

export class CreatePersonDTO {
  nome: string;
  email?: string;
  tipo: 'F' | 'J';

  fisica?: FisicaDTO;

  juridica?: JuridicaDTO;

  contatos?: ContactDTO[];
  enderecos?: AddressDTO[];

  cadastro?: Date;
  observacao?: string;
}