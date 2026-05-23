import { HttpException, HttpStatus } from '@nestjs/common';
import { GetByIdAccountPayableUseCase } from '../../src/application/use-cases/get-by-id-account-payable.use-case';
import { IAccountPayableRepository } from '../../src/domain/repository/account-payable.interface.repository';
import { IInstallmentRepository } from '../../../installments/src/domain/repository/installment.interface.repository';

describe('GetByIdAccountPayableUseCase', () => {
  let useCase: GetByIdAccountPayableUseCase;
  let repository: jest.Mocked<IAccountPayableRepository>;
  let installmentRepository: jest.Mocked<IInstallmentRepository>;

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

    useCase = new GetByIdAccountPayableUseCase(repository, installmentRepository);
  });

  it('should return account payable with installment summary when found', async () => {
    const account = {
      id: 'uuid-1',
      pessoaId: 'pessoa-uuid',
      numeroDocumento: 'NF-001',
      descricao: 'Compra de materiais',
      categoriaFinanceiraId: 'cat-uuid',
      dataEmissao: new Date('2024-01-01'),
      dataVencimento: new Date('2024-02-01'),
      valor: 1500.50,
      valorPago: 0,
      status: 'PENDENTE',
      createdAt: new Date(),
    };

    const parcelas = [
      {
        id: 'parcela-1',
        origem: 'PAGAR' as const,
        origemId: 'uuid-1',
        numeroParcela: 1,
        totalParcelas: 3,
        dataVencimento: new Date('2024-02-01'),
        valor: 500.17,
        valorPago: 500.17,
        status: 'PAGO' as const,
        createdAt: new Date(),
      },
      {
        id: 'parcela-2',
        origem: 'PAGAR' as const,
        origemId: 'uuid-1',
        numeroParcela: 2,
        totalParcelas: 3,
        dataVencimento: new Date('2024-03-01'),
        valor: 500.17,
        valorPago: 0,
        status: 'PENDENTE' as const,
        createdAt: new Date(),
      },
      {
        id: 'parcela-3',
        origem: 'PAGAR' as const,
        origemId: 'uuid-1',
        numeroParcela: 3,
        totalParcelas: 3,
        dataVencimento: new Date('2024-04-01'),
        valor: 500.16,
        valorPago: 0,
        status: 'PENDENTE' as const,
        createdAt: new Date(),
      },
    ];

    repository.findById.mockResolvedValue(account as any);
    installmentRepository.findByOrigemId.mockResolvedValue(parcelas);

    const result = await useCase.execute({ id: 'uuid-1' });

    expect(result.conta).toEqual(account);
    expect(result.parcelamento).toEqual({
      valorTotal: 1500.50,
      quantidadeTotal: 3,
      quantidadePagas: 1,
      valorTotalPago: 500.17,
      valorRestante: 1000.33,
    });
    expect(repository.findById).toHaveBeenCalledWith('uuid-1');
    expect(installmentRepository.findByOrigemId).toHaveBeenCalledWith('uuid-1');
  });

  it('should return zeroed summary when no installments exist', async () => {
    const account = {
      id: 'uuid-1',
      pessoaId: 'pessoa-uuid',
      numeroDocumento: 'NF-001',
      descricao: 'Compra de materiais',
      categoriaFinanceiraId: 'cat-uuid',
      dataEmissao: new Date('2024-01-01'),
      dataVencimento: new Date('2024-02-01'),
      valor: 1500.50,
      valorPago: 0,
      status: 'PENDENTE',
      createdAt: new Date(),
    };

    repository.findById.mockResolvedValue(account as any);
    installmentRepository.findByOrigemId.mockResolvedValue([]);

    const result = await useCase.execute({ id: 'uuid-1' });

    expect(result.conta).toEqual(account);
    expect(result.parcelamento).toEqual({
      valorTotal: 0,
      quantidadeTotal: 0,
      quantidadePagas: 0,
      valorTotalPago: 0,
      valorRestante: 0,
    });
  });

  it('should exclude CANCELADO installments from summary calculations', async () => {
    const account = {
      id: 'uuid-1',
      pessoaId: 'pessoa-uuid',
      numeroDocumento: 'NF-001',
      descricao: 'Compra de materiais',
      categoriaFinanceiraId: 'cat-uuid',
      dataEmissao: new Date('2024-01-01'),
      dataVencimento: new Date('2024-02-01'),
      valor: 1000,
      valorPago: 0,
      status: 'PENDENTE',
      createdAt: new Date(),
    };

    const parcelas = [
      {
        id: 'parcela-1',
        origem: 'PAGAR' as const,
        origemId: 'uuid-1',
        numeroParcela: 1,
        totalParcelas: 2,
        dataVencimento: new Date('2024-02-01'),
        valor: 500,
        valorPago: 500,
        status: 'PAGO' as const,
        createdAt: new Date(),
      },
      {
        id: 'parcela-2',
        origem: 'PAGAR' as const,
        origemId: 'uuid-1',
        numeroParcela: 2,
        totalParcelas: 2,
        dataVencimento: new Date('2024-03-01'),
        valor: 500,
        valorPago: 0,
        status: 'CANCELADO' as const,
        createdAt: new Date(),
      },
      {
        id: 'parcela-3',
        origem: 'PAGAR' as const,
        origemId: 'uuid-1',
        numeroParcela: 3,
        totalParcelas: 2,
        dataVencimento: new Date('2024-03-01'),
        valor: 500,
        valorPago: 0,
        status: 'PENDENTE' as const,
        createdAt: new Date(),
      },
    ];

    repository.findById.mockResolvedValue(account as any);
    installmentRepository.findByOrigemId.mockResolvedValue(parcelas);

    const result = await useCase.execute({ id: 'uuid-1' });

    expect(result.parcelamento).toEqual({
      valorTotal: 1000,
      quantidadeTotal: 2,
      quantidadePagas: 1,
      valorTotalPago: 500,
      valorRestante: 500,
    });
  });

  it('should throw 404 when account payable is not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: 'non-existent-id' })).rejects.toThrow(
      new HttpException('Conta a pagar não encontrada', HttpStatus.NOT_FOUND),
    );
    expect(repository.findById).toHaveBeenCalledWith('non-existent-id');
  });
});
