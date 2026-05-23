import { HttpException, HttpStatus } from '@nestjs/common';
import { CreateAccountPayableUseCase } from '../../src/application/use-cases/create-account-payable.use-case';
import { IAccountPayableRepository } from '../../src/domain/repository/account-payable.interface.repository';
import { IInstallmentRepository } from '../../../installments/src/domain/repository/installment.interface.repository';
import { InstallmentCalculator } from '../../../installments/src/domain/services/installment-calculator';
import { InstallmentValidation } from '../../../installments/src/domain/validation/installment-validation';

describe('CreateAccountPayableUseCase', () => {
  let useCase: CreateAccountPayableUseCase;
  let repository: jest.Mocked<IAccountPayableRepository>;
  let installmentRepository: jest.Mocked<IInstallmentRepository>;
  let installmentCalculator: InstallmentCalculator;
  let installmentValidation: InstallmentValidation;
  let mockTransaction: any;
  let mockConnection: any;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      updateValorPago: jest.fn(),
    };

    installmentRepository = {
      create: jest.fn(),
      createMany: jest.fn(),
      findById: jest.fn(),
      findByOrigemId: jest.fn(),
      updateValorPago: jest.fn(),
      updateStatus: jest.fn(),
      hasSettlements: jest.fn(),
      updateValor: jest.fn(),
      cancelMany: jest.fn(),
      findPendingByOrigemId: jest.fn(),
      getMaxNumeroParcela: jest.fn(),
      hasSettlementsByParcelaIds: jest.fn(),
    };

    installmentCalculator = new InstallmentCalculator();
    installmentValidation = new InstallmentValidation();

    mockTransaction = {};
    mockConnection = jest.fn().mockReturnValue({
      tx: jest.fn((callback) => callback(mockTransaction)),
    });

    useCase = new CreateAccountPayableUseCase(
      repository,
      installmentRepository,
      mockConnection,
      installmentCalculator,
      installmentValidation,
    );
  });

  it('should create an account payable with valid data and generate single installment when no parcelamento', async () => {
    const input = {
      pessoaId: 'pessoa-uuid',
      numeroDocumento: 'NF-001',
      descricao: 'Compra de materiais',
      categoriaFinanceiraId: 'cat-uuid',
      dataEmissao: new Date('2024-01-01'),
      dataVencimento: new Date('2024-02-01'),
      valor: 1500.50,
    };
    const createdAccount = {
      id: 'uuid-1',
      ...input,
      valorPago: 0,
      status: 'PENDENTE',
      createdAt: new Date(),
    };

    repository.create.mockResolvedValue(createdAccount as any);
    installmentRepository.createMany.mockResolvedValue([
      {
        id: 'inst-1',
        origem: 'PAGAR',
        origemId: 'uuid-1',
        numeroParcela: 1,
        totalParcelas: 1,
        dataVencimento: new Date('2024-02-01'),
        valor: 1500.50,
        valorPago: 0,
        status: 'PENDENTE',
        createdAt: new Date(),
      },
    ] as any);

    const result = await useCase.execute(input);

    expect(result).toEqual(createdAccount);
    expect(repository.create).toHaveBeenCalledWith(input, mockTransaction);
    expect(installmentRepository.createMany).toHaveBeenCalledWith(
      [
        {
          origem: 'PAGAR',
          origemId: 'uuid-1',
          numeroParcela: 1,
          totalParcelas: 1,
          dataVencimento: new Date('2024-02-01'),
          valor: 1500.50,
        },
      ],
      mockTransaction,
    );
  });

  it('should create an account payable with parcelamento and generate multiple installments', async () => {
    const input = {
      pessoaId: 'pessoa-uuid',
      numeroDocumento: 'NF-002',
      descricao: 'Compra parcelada',
      categoriaFinanceiraId: 'cat-uuid',
      dataEmissao: new Date('2024-01-01'),
      dataVencimento: new Date('2024-02-01'),
      valor: 300,
      parcelamento: {
        quantidadeParcelas: 3,
      },
    };
    const createdAccount = {
      id: 'uuid-2',
      ...input,
      valorPago: 0,
      status: 'PENDENTE',
      createdAt: new Date(),
    };

    repository.create.mockResolvedValue(createdAccount as any);
    installmentRepository.createMany.mockResolvedValue([
      { id: 'inst-1', origem: 'PAGAR', origemId: 'uuid-2', numeroParcela: 1, totalParcelas: 3, valor: 100, valorPago: 0, status: 'PENDENTE', dataVencimento: new Date('2024-02-01'), createdAt: new Date() },
      { id: 'inst-2', origem: 'PAGAR', origemId: 'uuid-2', numeroParcela: 2, totalParcelas: 3, valor: 100, valorPago: 0, status: 'PENDENTE', dataVencimento: new Date('2024-03-01'), createdAt: new Date() },
      { id: 'inst-3', origem: 'PAGAR', origemId: 'uuid-2', numeroParcela: 3, totalParcelas: 3, valor: 100, valorPago: 0, status: 'PENDENTE', dataVencimento: new Date('2024-04-01'), createdAt: new Date() },
    ] as any);

    const result = await useCase.execute(input);

    expect(result).toEqual(createdAccount);
    expect(repository.create).toHaveBeenCalledWith(input, mockTransaction);
    expect(installmentRepository.createMany).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          origem: 'PAGAR',
          origemId: 'uuid-2',
          numeroParcela: 1,
          totalParcelas: 3,
          valor: 100,
        }),
        expect.objectContaining({
          origem: 'PAGAR',
          origemId: 'uuid-2',
          numeroParcela: 2,
          totalParcelas: 3,
          valor: 100,
        }),
        expect.objectContaining({
          origem: 'PAGAR',
          origemId: 'uuid-2',
          numeroParcela: 3,
          totalParcelas: 3,
          valor: 100,
        }),
      ]),
      mockTransaction,
    );
  });

  it('should create an account payable with custom values parcelamento', async () => {
    const input = {
      pessoaId: 'pessoa-uuid',
      numeroDocumento: 'NF-003',
      descricao: 'Compra com valores personalizados',
      categoriaFinanceiraId: 'cat-uuid',
      dataEmissao: new Date('2024-01-01'),
      dataVencimento: new Date('2024-02-01'),
      valor: 1000,
      parcelamento: {
        quantidadeParcelas: 3,
        valores: [500, 300, 200],
      },
    };
    const createdAccount = {
      id: 'uuid-3',
      ...input,
      valorPago: 0,
      status: 'PENDENTE',
      createdAt: new Date(),
    };

    repository.create.mockResolvedValue(createdAccount as any);
    installmentRepository.createMany.mockResolvedValue([
      { id: 'inst-1', origem: 'PAGAR', origemId: 'uuid-3', numeroParcela: 1, totalParcelas: 3, valor: 500, valorPago: 0, status: 'PENDENTE', dataVencimento: new Date('2024-02-01'), createdAt: new Date() },
      { id: 'inst-2', origem: 'PAGAR', origemId: 'uuid-3', numeroParcela: 2, totalParcelas: 3, valor: 300, valorPago: 0, status: 'PENDENTE', dataVencimento: new Date('2024-03-01'), createdAt: new Date() },
      { id: 'inst-3', origem: 'PAGAR', origemId: 'uuid-3', numeroParcela: 3, totalParcelas: 3, valor: 200, valorPago: 0, status: 'PENDENTE', dataVencimento: new Date('2024-04-01'), createdAt: new Date() },
    ] as any);

    const result = await useCase.execute(input);

    expect(result).toEqual(createdAccount);
    expect(installmentRepository.createMany).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ valor: 500, numeroParcela: 1 }),
        expect.objectContaining({ valor: 300, numeroParcela: 2 }),
        expect.objectContaining({ valor: 200, numeroParcela: 3 }),
      ]),
      mockTransaction,
    );
  });

  it('should throw 400 when dataVencimento is before dataEmissao', async () => {
    const input = {
      pessoaId: 'pessoa-uuid',
      numeroDocumento: 'NF-001',
      descricao: 'Compra',
      categoriaFinanceiraId: 'cat-uuid',
      dataEmissao: new Date('2024-03-01'),
      dataVencimento: new Date('2024-01-01'),
      valor: 100,
    };

    await expect(useCase.execute(input)).rejects.toThrow(
      new HttpException(
        'A data de vencimento deve ser igual ou posterior à data de emissão',
        HttpStatus.BAD_REQUEST,
      ),
    );
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('should accept when dataVencimento equals dataEmissao', async () => {
    const input = {
      pessoaId: 'pessoa-uuid',
      numeroDocumento: 'NF-001',
      descricao: 'Compra',
      categoriaFinanceiraId: 'cat-uuid',
      dataEmissao: new Date('2024-01-15'),
      dataVencimento: new Date('2024-01-15'),
      valor: 500,
    };
    const createdAccount = { id: 'uuid-1', ...input, valorPago: 0, status: 'PENDENTE', createdAt: new Date() };

    repository.create.mockResolvedValue(createdAccount as any);
    installmentRepository.createMany.mockResolvedValue([
      {
        id: 'inst-1',
        origem: 'PAGAR',
        origemId: 'uuid-1',
        numeroParcela: 1,
        totalParcelas: 1,
        dataVencimento: new Date('2024-01-15'),
        valor: 500,
        valorPago: 0,
        status: 'PENDENTE',
        createdAt: new Date(),
      },
    ] as any);

    const result = await useCase.execute(input);

    expect(result).toEqual(createdAccount);
    expect(repository.create).toHaveBeenCalledWith(input, mockTransaction);
  });

  it('should throw 400 when parcelamento.quantidadeParcelas is invalid', async () => {
    const input = {
      pessoaId: 'pessoa-uuid',
      numeroDocumento: 'NF-001',
      descricao: 'Compra',
      categoriaFinanceiraId: 'cat-uuid',
      dataEmissao: new Date('2024-01-01'),
      dataVencimento: new Date('2024-02-01'),
      valor: 100,
      parcelamento: {
        quantidadeParcelas: 0,
      },
    };

    await expect(useCase.execute(input)).rejects.toThrow(HttpException);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('should throw 400 when parcelamento.valores sum does not match valor total', async () => {
    const input = {
      pessoaId: 'pessoa-uuid',
      numeroDocumento: 'NF-001',
      descricao: 'Compra',
      categoriaFinanceiraId: 'cat-uuid',
      dataEmissao: new Date('2024-01-01'),
      dataVencimento: new Date('2024-02-01'),
      valor: 1000,
      parcelamento: {
        quantidadeParcelas: 2,
        valores: [600, 500],
      },
    };

    await expect(useCase.execute(input)).rejects.toThrow(HttpException);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('should throw integrity error when created installments sum does not match valor total', async () => {
    const input = {
      pessoaId: 'pessoa-uuid',
      numeroDocumento: 'NF-001',
      descricao: 'Compra',
      categoriaFinanceiraId: 'cat-uuid',
      dataEmissao: new Date('2024-01-01'),
      dataVencimento: new Date('2024-02-01'),
      valor: 300,
      parcelamento: {
        quantidadeParcelas: 3,
      },
    };
    const createdAccount = {
      id: 'uuid-4',
      ...input,
      valorPago: 0,
      status: 'PENDENTE',
      createdAt: new Date(),
    };

    repository.create.mockResolvedValue(createdAccount as any);
    // Simulate repository returning wrong values (integrity issue)
    installmentRepository.createMany.mockResolvedValue([
      { id: 'inst-1', origem: 'PAGAR', origemId: 'uuid-4', numeroParcela: 1, totalParcelas: 3, valor: 100, valorPago: 0, status: 'PENDENTE', dataVencimento: new Date(), createdAt: new Date() },
      { id: 'inst-2', origem: 'PAGAR', origemId: 'uuid-4', numeroParcela: 2, totalParcelas: 3, valor: 100, valorPago: 0, status: 'PENDENTE', dataVencimento: new Date(), createdAt: new Date() },
      { id: 'inst-3', origem: 'PAGAR', origemId: 'uuid-4', numeroParcela: 3, totalParcelas: 3, valor: 99, valorPago: 0, status: 'PENDENTE', dataVencimento: new Date(), createdAt: new Date() },
    ] as any);

    await expect(useCase.execute(input)).rejects.toThrow(HttpException);
    await expect(useCase.execute(input)).rejects.toMatchObject({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    });
  });
});
