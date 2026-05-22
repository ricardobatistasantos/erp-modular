export class CreateBankAccountDTO {
  bancoAgenciaId: string;
  numero: string;
  digito: string;
  nome: string;
  tipo: string; // 'I' | 'P' | 'C'
  descricao?: string;
}
