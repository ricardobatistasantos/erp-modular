import { HttpException, HttpStatus } from '@nestjs/common';
import { SettleInstallmentUseCase } from '../application/use-cases/settle-installment.use-case';
import { SettleInstallmentDTO } from '../application/dto/settle-installment.dto';
import { Installment } from '../../../installments/src/domain/entity/installment.entity';
import { FinancialSettlement } from '../domain/entity/financial-settlement.entity';

describe('SettleInstallmentUseCase', () => {
  let useCase: SettleInstallmentUseCase;
  let settlementRepository: any;
  let installmentRepository: any;
  let accountPayableRepository: any;
  let accountReceivableRepository: any;
  let financialEntryRepository: any;
  let connection: any;
  let transaction: any;

  beforeEach(() => {
    transaction = {};

    settlementRepository = {
      create: jest.fn(),
    };

    installmentRepository = {
      findById: jest.fn(),
      findByOrigemId: jest.fn(),
      updateValorPago: jest.fn(),
    };

    accountPayableRepository = {
      findById: jest.fn(),
      updateValorPago: jest.fn(),
    };

    accountReceivableRepository = {
      findById: jest.fn(),
      updateValorRecebido: jest.fn(),
    };

    financialEntryRepository = {
      create: jest.fn(),
    };

    connection = jest.fn(() => ({
      tx: jest.fn((callback) => callback(transaction)),
    }));

    useCase = new SettleInstallmentUseCase(
      settlementRepository,
      installmentRepository,
      accountPayableRepository,
      accountReceivableRepository,
      financialEntryRepository,
      connection,
    );
  });

  // --- Error scenarios ---

  it('should throw 404 when installment is not found', async () => {
    installmentRepository.findById.mockResolvedValue(null);

    const dto = createDTO({ parcelaId: 'non-existent-id' });

    await expect(useCase.execute(dto)).rejects.toThrow(
      new HttpException('Parcela não encontrada', HttpStatus.NOT_FOUND),
    );
  });

  it('should throw 400 when valorLiquido exceeds remaining balance', async () => {
    const installment = createInstallment({
      valor: 100,
      valorPago: 80,
    });
    installmentRepository.findById.mockResolvedValue(installment);

    const dto = createDTO({ valor: 25 }); // valorLiquido = 25, saldo = 20

    await expect(useCase.execute(dto)).rejects.toThrow(HttpException);
    await expect(useCase.execute(dto)).rejects.toMatchObject({
      status: HttpStatus.BAD_REQUEST,
      message: expect.stringContaining('excede o saldo restante da parcela'),
    });
  });

  it('should throw 400 when installment is already fully paid', async () => {
    const installment = createInstallment({
      valor: 100,
      valorPago: 100,
      status: 'PAGO',
    });
    installmentRepository.findById.mockResolvedValue(installment);

    const dto = createDTO({ valor: 10 });

    await expect(useCase.execute(dto)).rejects.toThrow(
      new HttpException(
        'Parcela já está totalmente quitada',
        HttpStatus.BAD_REQUEST,
      ),
    );
  });

  it('should throw 400 when juros is negative', async () => {
    const dto = createDTO({ juros: -5 });

    await expect(useCase.execute(dto)).rejects.toThrow(
      new HttpException(
        'Valores de juros, multa e desconto devem ser >= 0',
        HttpStatus.BAD_REQUEST,
      ),
    );
  });

  it('should throw 400 when multa is negative', async () => {
    const dto = createDTO({ multa: -3 });

    await expect(useCase.execute(dto)).rejects.toThrow(
      new HttpException(
        'Valores de juros, multa e desconto devem ser >= 0',
        HttpStatus.BAD_REQUEST,
      ),
    );
  });

  it('should throw 400 when desconto is negative', async () => {
    const dto = createDTO({ desconto: -2 });

    await expect(useCase.execute(dto)).rejects.toThrow(
      new HttpException(
        'Valores de juros, multa e desconto devem ser >= 0',
        HttpStatus.BAD_REQUEST,
      ),
    );
  });

  // --- Partial payment scenario ---

  it('should update installment status to PARCIAL on partial payment', async () => {
    const installment = createInstallment({
      id: 'parcela-1',
      origem: 'PAGAR',
      origemId: 'conta-1',
      valor: 100,
      valorPago: 0,
      status: 'PENDENTE',
    });
    const settlement = createSettlement({ parcelaId: 'parcela-1', valorLiquido: 50 });

    installmentRepository.findById.mockResolvedValue(installment);
    accountPayableRepository.findById.mockResolvedValue({ id: 'conta-1', categoriaFinanceiraId: 'cat-1' });
    financialEntryRepository.create.mockResolvedValue({ id: 'entry-1' });
    settlementRepository.create.mockResolvedValue(settlement);
    installmentRepository.updateValorPago.mockResolvedValue({ ...installment, valorPago: 50, status: 'PARCIAL' });
    installmentRepository.findByOrigemId.mockResolvedValue([installment]);
    accountPayableRepository.updateValorPago.mockResolvedValue({});

    const dto = createDTO({ parcelaId: 'parcela-1', valor: 50, tipoConta: 'PAGAR' });
    await useCase.execute(dto);

    expect(installmentRepository.updateValorPago).toHaveBeenCalledWith(
      'parcela-1',
      50,
      'PARCIAL',
      transaction,
    );
  });

  // --- Full payment scenario ---

  it('should update installment status to PAGO on full payment', async () => {
    const installment = createInstallment({
      id: 'parcela-1',
      origem: 'PAGAR',
      origemId: 'conta-1',
      valor: 100,
      valorPago: 0,
      status: 'PENDENTE',
    });
    const settlement = createSettlement({ parcelaId: 'parcela-1', valorLiquido: 100 });

    installmentRepository.findById.mockResolvedValue(installment);
    accountPayableRepository.findById.mockResolvedValue({ id: 'conta-1', categoriaFinanceiraId: 'cat-1' });
    financialEntryRepository.create.mockResolvedValue({ id: 'entry-1' });
    settlementRepository.create.mockResolvedValue(settlement);
    installmentRepository.updateValorPago.mockResolvedValue({ ...installment, valorPago: 100, status: 'PAGO' });
    installmentRepository.findByOrigemId.mockResolvedValue([installment]);
    accountPayableRepository.updateValorPago.mockResolvedValue({});

    const dto = createDTO({ parcelaId: 'parcela-1', valor: 100, tipoConta: 'PAGAR' });
    await useCase.execute(dto);

    expect(installmentRepository.updateValorPago).toHaveBeenCalledWith(
      'parcela-1',
      100,
      'PAGO',
      transaction,
    );
  });

  // --- Parent account update when all installments are paid ---

  it('should update parent account status to PAGO when all installments are paid (PAGAR)', async () => {
    const installment = createInstallment({
      id: 'parcela-2',
      origem: 'PAGAR',
      origemId: 'conta-1',
      valor: 50,
      valorPago: 0,
      status: 'PENDENTE',
    });
    const paidSibling = createInstallment({
      id: 'parcela-1',
      origem: 'PAGAR',
      origemId: 'conta-1',
      valor: 50,
      valorPago: 50,
      status: 'PAGO',
    });
    const settlement = createSettlement({ parcelaId: 'parcela-2', valorLiquido: 50 });

    installmentRepository.findById.mockResolvedValue(installment);
    accountPayableRepository.findById.mockResolvedValue({ id: 'conta-1', categoriaFinanceiraId: 'cat-1' });
    financialEntryRepository.create.mockResolvedValue({ id: 'entry-1' });
    settlementRepository.create.mockResolvedValue(settlement);
    installmentRepository.updateValorPago.mockResolvedValue({ ...installment, valorPago: 50, status: 'PAGO' });
    installmentRepository.findByOrigemId.mockResolvedValue([paidSibling, installment]);
    accountPayableRepository.updateValorPago.mockResolvedValue({});

    const dto = createDTO({ parcelaId: 'parcela-2', valor: 50, tipoConta: 'PAGAR' });
    await useCase.execute(dto);

    expect(accountPayableRepository.updateValorPago).toHaveBeenCalledWith(
      'conta-1',
      100,
      'PAGO',
      transaction,
    );
  });

  it('should update parent account status to RECEBIDO when all installments are paid (RECEBER)', async () => {
    const installment = createInstallment({
      id: 'parcela-1',
      origem: 'RECEBER',
      origemId: 'conta-1',
      valor: 200,
      valorPago: 0,
      status: 'PENDENTE',
    });
    const settlement = createSettlement({ parcelaId: 'parcela-1', valorLiquido: 200 });

    installmentRepository.findById.mockResolvedValue(installment);
    accountReceivableRepository.findById.mockResolvedValue({ id: 'conta-1', categoriaFinanceiraId: 'cat-1' });
    financialEntryRepository.create.mockResolvedValue({ id: 'entry-1' });
    settlementRepository.create.mockResolvedValue(settlement);
    installmentRepository.updateValorPago.mockResolvedValue({ ...installment, valorPago: 200, status: 'PAGO' });
    installmentRepository.findByOrigemId.mockResolvedValue([installment]);
    accountReceivableRepository.updateValorRecebido.mockResolvedValue({});

    const dto = createDTO({ parcelaId: 'parcela-1', valor: 200, tipoConta: 'RECEBER' });
    await useCase.execute(dto);

    expect(accountReceivableRepository.updateValorRecebido).toHaveBeenCalledWith(
      'conta-1',
      200,
      'RECEBIDO',
      transaction,
    );
  });

  // --- Optional fields as null ---

  it('should handle optional fields as null (contaBancariaId, caixaId, observacao)', async () => {
    const installment = createInstallment({
      id: 'parcela-1',
      origem: 'PAGAR',
      origemId: 'conta-1',
      valor: 100,
      valorPago: 0,
    });
    const settlement = createSettlement({ parcelaId: 'parcela-1', valorLiquido: 100 });

    installmentRepository.findById.mockResolvedValue(installment);
    accountPayableRepository.findById.mockResolvedValue({ id: 'conta-1', categoriaFinanceiraId: 'cat-1' });
    financialEntryRepository.create.mockResolvedValue({ id: 'entry-1' });
    settlementRepository.create.mockResolvedValue(settlement);
    installmentRepository.updateValorPago.mockResolvedValue({ ...installment, valorPago: 100, status: 'PAGO' });
    installmentRepository.findByOrigemId.mockResolvedValue([installment]);
    accountPayableRepository.updateValorPago.mockResolvedValue({});

    const dto = createDTO({
      parcelaId: 'parcela-1',
      valor: 100,
      tipoConta: 'PAGAR',
      contaBancariaId: undefined,
      caixaId: undefined,
      observacao: undefined,
    });
    await useCase.execute(dto);

    expect(settlementRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        contaBancariaId: null,
        caixaId: null,
        observacao: null,
      }),
      transaction,
    );

    expect(financialEntryRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        contaBancariaId: null,
        caixaId: null,
      }),
      transaction,
    );
  });
});

// --- Helper factories ---

function createInstallment(overrides: Partial<Installment> = {}): Installment {
  return {
    id: 'default-parcela-id',
    origem: 'PAGAR',
    origemId: 'default-conta-id',
    numeroParcela: 1,
    totalParcelas: 3,
    dataVencimento: new Date('2024-02-15'),
    valor: 100,
    valorPago: 0,
    status: 'PENDENTE',
    createdAt: new Date('2024-01-01'),
    ...overrides,
  };
}

function createSettlement(overrides: Partial<FinancialSettlement> = {}): FinancialSettlement {
  return {
    id: 'default-settlement-id',
    tipoConta: 'PAGAR',
    parcelaId: 'default-parcela-id',
    valor: 100,
    juros: 0,
    multa: 0,
    desconto: 0,
    valorLiquido: 100,
    dataPagamento: new Date('2024-02-15'),
    formaPagamento: 'PIX',
    lancamentoFinanceiroId: 'entry-1',
    createdAt: new Date('2024-02-15'),
    ...overrides,
  };
}

function createDTO(overrides: Partial<SettleInstallmentDTO> = {}): SettleInstallmentDTO {
  return {
    parcelaId: 'default-parcela-id',
    tipoConta: 'PAGAR',
    valor: 100,
    dataPagamento: new Date('2024-02-15'),
    formaPagamento: 'PIX',
    ...overrides,
  };
}
