export class EmployeeDTO  {
  
    matricula: string;
    dataAdmissao?: Date;
    dataDemissao?: Date;

    cargo: {
      nome: string;
      salario: number;
    };

    departamento: {
      nome: string;
    };

    vendedor?: {
      comissao: number;
      metaVendas: number;
    };
  };