import { FindInstallmentsByOrigemUseCase } from '../application/use-cases/find-installments-by-origem.use-case';
import { Installment } from '../domain/entity/installment.entity';

describe('FindInstallmentsByOrigemUseCase', () => {
  let useCase: FindInstallmentsByOrigemUseCase;
  let installmentRepository: any;

  beforeEach(() => {
    installmentRepository = {
      findByOrigemId: jest.fn(),
    };

    useCase = new FindInstallmentsByOrigemUseCase(installmentRepository);
  });

  it('should return empty list and zeroed summary when no installments exist', async () => {
    installmentRepository.findByOrigemId.mockResolvedValue([]);

    const result = await useCase.execute({ origemId: 'conta-1' });

    expect(result.parcelas).toEqual([]);
    expect(result.resumo).toEqual({
      valorTotal: 0,
      quantidadeTotal: 0,
      quantidadePagas: 0,
      valorTotalPago: 0,
      valorRestante: 0,
    });
  });

  it('should return all installments including cancelled ones in the list', async () => {
    const parcelas = [
      createInstallment({ id: '1', numeroParcela: 1, status: 'PAGO', valor: 100, valorPago: 100 }),
      createInstallment({ id: '2', numeroParcela: 2, status: 'CANCELADO', valor: 100, valorPago: 0 }),
      createInstallment({ id: '3', numeroParcela: 3, status: 'PENDENTE', valor: 100, valorPago: 0 }),
    ];
    installmentRepository.findByOrigemId.mockResolvedValue(parcelas);

    const result = await useCase.execute({ origemId: 'conta-1' });

    expect(result.parcelas).toHaveLength(3);
    expect(result.parcelas[1].status).toBe('CANCELADO');
  });

  it('should exclude cancelled installments from summary calculations', async () => {
    const parcelas = [
      createInstallment({ id: '1', numeroParcela: 1, status: 'PAGO', valor: 100, valorPago: 100 }),
      createInstallment({ id: '2', numeroParcela: 2, status: 'CANCELADO', valor: 100, valorPago: 0 }),
      createInstallment({ id: '3', numeroParcela: 3, status: 'PENDENTE', valor: 100, valorPago: 0 }),
    ];
    installmentRepository.findByOrigemId.mockResolvedValue(parcelas);

    const result = await useCase.execute({ origemId: 'conta-1' });

    expect(result.resumo.valorTotal).toBe(200);
    expect(result.resumo.quantidadeTotal).toBe(2);
    expect(result.resumo.quantidadePagas).toBe(1);
    expect(result.resumo.valorTotalPago).toBe(100);
    expect(result.resumo.valorRestante).toBe(100);
  });

  it('should calculate summary correctly when all installments are paid', async () => {
    const parcelas = [
      createInstallment({ id: '1', numeroParcela: 1, status: 'PAGO', valor: 150, valorPago: 150 }),
      createInstallment({ id: '2', numeroParcela: 2, status: 'PAGO', valor: 150, valorPago: 150 }),
    ];
    installmentRepository.findByOrigemId.mockResolvedValue(parcelas);

    const result = await useCase.execute({ origemId: 'conta-1' });

    expect(result.resumo.valorTotal).toBe(300);
    expect(result.resumo.quantidadeTotal).toBe(2);
    expect(result.resumo.quantidadePagas).toBe(2);
    expect(result.resumo.valorTotalPago).toBe(300);
    expect(result.resumo.valorRestante).toBe(0);
  });

  it('should handle partial payments in summary', async () => {
    const parcelas = [
      createInstallment({ id: '1', numeroParcela: 1, status: 'PARCIAL', valor: 200, valorPago: 50 }),
      createInstallment({ id: '2', numeroParcela: 2, status: 'PENDENTE', valor: 200, valorPago: 0 }),
    ];
    installmentRepository.findByOrigemId.mockResolvedValue(parcelas);

    const result = await useCase.execute({ origemId: 'conta-1' });

    expect(result.resumo.valorTotal).toBe(400);
    expect(result.resumo.quantidadeTotal).toBe(2);
    expect(result.resumo.quantidadePagas).toBe(0);
    expect(result.resumo.valorTotalPago).toBe(50);
    expect(result.resumo.valorRestante).toBe(350);
  });

  it('should handle decimal precision correctly', async () => {
    const parcelas = [
      createInstallment({ id: '1', numeroParcela: 1, status: 'PAGO', valor: 33.33, valorPago: 33.33 }),
      createInstallment({ id: '2', numeroParcela: 2, status: 'PAGO', valor: 33.33, valorPago: 33.33 }),
      createInstallment({ id: '3', numeroParcela: 3, status: 'PENDENTE', valor: 33.34, valorPago: 0 }),
    ];
    installmentRepository.findByOrigemId.mockResolvedValue(parcelas);

    const result = await useCase.execute({ origemId: 'conta-1' });

    expect(result.resumo.valorTotal).toBe(100);
    expect(result.resumo.valorTotalPago).toBe(66.66);
    expect(result.resumo.valorRestante).toBe(33.34);
  });

  it('should call repository with correct origemId', async () => {
    installmentRepository.findByOrigemId.mockResolvedValue([]);

    await useCase.execute({ origemId: 'my-conta-id' });

    expect(installmentRepository.findByOrigemId).toHaveBeenCalledWith('my-conta-id');
  });
});

function createInstallment(overrides: Partial<Installment> = {}): Installment {
  return {
    id: 'default-id',
    origem: 'PAGAR',
    origemId: 'conta-1',
    numeroParcela: 1,
    totalParcelas: 3,
    dataVencimento: new Date('2024-01-15'),
    valor: 100,
    valorPago: 0,
    status: 'PENDENTE',
    createdAt: new Date('2024-01-01'),
    ...overrides,
  };
}
