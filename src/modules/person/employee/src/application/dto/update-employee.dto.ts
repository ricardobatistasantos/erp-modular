import { AddressDTO } from "@person/shared/dto/address.dto";
import { ContactDTO } from "@person/shared/dto/contact.dto";
import { FisicaDTO } from "@person/shared/dto/fisica.dto";
import { JuridicaDTO } from "@person/shared/dto/juridica.dto";

export class UpdateEmployeeDTO {

  pessoa?: {
    nome?: string;
    email?: string;
    observacao?: string;

    tipo: 'F' | 'J';
    fisica?: FisicaDTO;
    juridica?: JuridicaDTO;

    contatos?: ContactDTO[];
    enderecos?: AddressDTO[];
  };

  colaborador?: {
    matricula?: string;
    dataAdmissao?: Date;
    dataDemissao?: Date;

    cargo?: {
      nome: string;
      salario: number;
    };

    departamento?: {
      nome: string;
    };

    vendedor?: {
      comissao: number;
      metaVendas: number;
    };
  };
}
