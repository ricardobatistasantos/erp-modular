import { HttpException, HttpStatus } from '@nestjs/common';
import { CancelInstallmentUseCase } from '../application/use-cases/cancel-installment.use-case';
import { Installment } from '../domain/entity/installment.entity';

describe('CancelInstallmentUseCase', () => {
  let useCase: CancelInstallmentUseCase;
  let installmentRepository: any;
  let financialSettlementRepository: any;
  let accountPayableRepository: any;
  let accountReceivableRepository: any;
  let connection: any;
  let transaction: any;

  beforeEach(() => {
    transaction = {};

    installmentRepository = {
      findById: jest.fn(),
      findByOrigemId: jest.fn(),
      updateStatus: jest.fn(),
    };

    financialSettlementRepository = {
      existsByParcelaId: jest.fn(),
    };

    accountPayableRepository = {
      updateValorPago: jest.fn(),
    };

    accountReceivableRepository = {
      updateValorRecebido: jest.fn(),
    };

    connection = jest.fn(() => ({
      tx: jest.fn((callback) => callback(transaction)),
    }));

    useCase = new CancelInstallmentUseCase(
      installmentRepository,
      financialSettlementRepository,
      accountPayableRepository,
      accountReceivableRepository,
      connection,
    );
  });

  it('should throw 404 when installment is not found', async () => {
    installmentRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ parcelaId: 'non-existent-id' }),
    ).rejects.toThrow(
      new HttpException('Parcela não encontrada', HttpStatus.NOT_FOUND),
    );
  });

  it('should throw 400 when installment has settlements', async () => {
    const installment = createInstallment({ id: 'parcela-1' });
    installmentRepository.findById.mockResolvedValue(installment);
    financialSettlementRepository.existsByParcelaId.mockResolvedValue(true);

    await expect(
      useCase.execute({ parcelaId: 'parcela-1' }),
    ).rejects.toThrow(
      new HttpException(
        'Não é possível cancelar parcela: existem baixas financeiras vinculadas',
        HttpStatus.BAD_REQUEST,
      ),
    );
  });

  it('should cancel installment and update parent account status to PENDENTE (PAGAR)', async () => {
    const installment = createInstallment({
      id: 'parcela-1',
      origem: 'PAGAR',
      origemId: 'conta-1',
      status: 'PENDENTE',
      valorPago: 0,
    });
    const cancelledInstallment = { ...installment, status: 'CANCELADO' };
    const siblingInstallment = createInstallment({
      id: 'parcela-2',
      origem: 'PAGAR',
      origemId: 'conta-1',
      status: 'PENDENTE',
      valorPago: 0,
    });

    installmentRepository.findById.mockResolvedValue(installment);
    financialSettlementRepository.existsByParcelaId.mockResolvedValue(false);
    installmentRepository.updateStatus.mockResolvedValue(cancelledInstallment);
    installmentRepository.findByOrigemId.mockResolvedValue([
      cancelledInstallment,
      siblingInstallment,
    ]);
    accountPayableRepository.updateValorPago.mockResolvedValue({});

    const result = await useCase.execute({ parcelaId: 'parcela-1' });

    expect(result).toEqual(cancelledInstallment);
    expect(installmentRepository.updateStatus).toHaveBeenCalledWith(
      'parcela-1',
      'CANCELADO',
      transaction,
    );
    expect(accountPayableRepository.updateValorPago).toHaveBeenCalledWith(
      'conta-1',
      0,
      'PENDENTE',
      transaction,
    );
  });

  it('should cancel installment and update parent account status to PAGO when all remaining are paid (PAGAR)', async () => {
    const installment = createInstallment({
      id: 'parcela-1',
      origem: 'PAGAR',
      origemId: 'conta-1',
      status: 'PENDENTE',
      valorPago: 0,
    });
    const cancelledInstallment = { ...installment, status: 'CANCELADO' };
    const paidInstallment = createInstallment({
      id: 'parcela-2',
      origem: 'PAGAR',
      origemId: 'conta-1',
      status: 'PAGO',
      valor: 100,
      valorPago: 100,
    });

    installmentRepository.findById.mockResolvedValue(installment);
    financialSettlementRepository.existsByParcelaId.mockResolvedValue(false);
    installmentRepository.updateStatus.mockResolvedValue(cancelledInstallment);
    installmentRepository.findByOrigemId.mockResolvedValue([
      cancelledInstallment,
      paidInstallment,
    ]);
    accountPayableRepository.updateValorPago.mockResolvedValue({});

    await useCase.execute({ parcelaId: 'parcela-1' });

    expect(accountPayableRepository.updateValorPago).toHaveBeenCalledWith(
      'conta-1',
      100,
      'PAGO',
      transaction,
    );
  });

  it('should cancel installment and update parent account status to RECEBIDO when all remaining are paid (RECEBER)', async () => {
    const installment = createInstallment({
      id: 'parcela-1',
      origem: 'RECEBER',
      origemId: 'conta-1',
      status: 'PENDENTE',
      valorPago: 0,
    });
    const cancelledInstallment = { ...installment, status: 'CANCELADO' };
    const paidInstallment = createInstallment({
      id: 'parcela-2',
      origem: 'RECEBER',
      origemId: 'conta-1',
      status: 'PAGO',
      valor: 200,
      valorPago: 200,
    });

    installmentRepository.findById.mockResolvedValue(installment);
    financialSettlementRepository.existsByParcelaId.mockResolvedValue(false);
    installmentRepository.updateStatus.mockResolvedValue(cancelledInstallment);
    installmentRepository.findByOrigemId.mockResolvedValue([
      cancelledInstallment,
      paidInstallment,
    ]);
    accountReceivableRepository.updateValorRecebido.mockResolvedValue({});

    await useCase.execute({ parcelaId: 'parcela-1' });

    expect(accountReceivableRepository.updateValorRecebido).toHaveBeenCalledWith(
      'conta-1',
      200,
      'RECEBIDO',
      transaction,
    );
  });

  it('should cancel installment and update parent account status to PARCIAL when some are paid', async () => {
    const installment = createInstallment({
      id: 'parcela-1',
      origem: 'PAGAR',
      origemId: 'conta-1',
      status: 'PENDENTE',
      valorPago: 0,
    });
    const cancelledInstallment = { ...installment, status: 'CANCELADO' };
    const paidInstallment = createInstallment({
      id: 'parcela-2',
      origem: 'PAGAR',
      origemId: 'conta-1',
      status: 'PAGO',
      valor: 100,
      valorPago: 100,
    });
    const pendingInstallment = createInstallment({
      id: 'parcela-3',
      origem: 'PAGAR',
      origemId: 'conta-1',
      status: 'PENDENTE',
      valorPago: 0,
    });

    installmentRepository.findById.mockResolvedValue(installment);
    financialSettlementRepository.existsByParcelaId.mockResolvedValue(false);
    installmentRepository.updateStatus.mockResolvedValue(cancelledInstallment);
    installmentRepository.findByOrigemId.mockResolvedValue([
      cancelledInstallment,
      paidInstallment,
      pendingInstallment,
    ]);
    accountPayableRepository.updateValorPago.mockResolvedValue({});

    await useCase.execute({ parcelaId: 'parcela-1' });

    expect(accountPayableRepository.updateValorPago).toHaveBeenCalledWith(
      'conta-1',
      100,
      'PARCIAL',
      transaction,
    );
  });

  it('should cancel installment and update parent account status to CANCELADO when all are cancelled', async () => {
    const installment = createInstallment({
      id: 'parcela-1',
      origem: 'PAGAR',
      origemId: 'conta-1',
      status: 'PENDENTE',
      valorPago: 0,
    });
    const cancelledInstallment = { ...installment, status: 'CANCELADO' };

    installmentRepository.findById.mockResolvedValue(installment);
    financialSettlementRepository.existsByParcelaId.mockResolvedValue(false);
    installmentRepository.updateStatus.mockResolvedValue(cancelledInstallment);
    installmentRepository.findByOrigemId.mockResolvedValue([cancelledInstallment]);
    accountPayableRepository.updateValorPago.mockResolvedValue({});

    await useCase.execute({ parcelaId: 'parcela-1' });

    expect(accountPayableRepository.updateValorPago).toHaveBeenCalledWith(
      'conta-1',
      0,
      'CANCELADO',
      transaction,
    );
  });
});

function createInstallment(overrides: Partial<Installment> = {}): Installment {
  return {
    id: 'default-id',
    origem: 'PAGAR',
    origemId: 'default-origem-id',
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
