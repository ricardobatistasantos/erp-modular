import { SalesProfile } from "./salesProfile.entity";
import { JobPosition } from "./jobPosition.entity";
import { Department } from "./department.entity";

export class Employee {
  id?: string;
  personId: string;

  matricula: string;

  dataAdmissao: Date;
  dataDemissao?: Date;

  cargo: JobPosition;
  departamento: Department;

  vendedor?: SalesProfile;
}