export class RequisicaoAlmoxarifado {
  id: string;
  solicitanteId: string;
  setorId: string;
  status: string;
  observacao?: string;
  createdAt: Date;

  constructor(partial?: Partial<RequisicaoAlmoxarifado>) {
    Object.assign(this, partial);
  }
}
