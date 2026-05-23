import { HttpException, HttpStatus } from '@nestjs/common';
import { GetByIdAccountReceivableUseCase } from '../../src/application/use-cases/get-by-id-account-receivable.use-case';
import { IAccountReceivableRepository } from '../../src/domain/repository/account-receivable.interface.repository';
import { IInstallmentRepository } from '../../../../finance/installments/src/domain/repository/installment.interface.repository';

describe('GetByIdAccountReceivableUseCase', () => {
  let useCase: GetByIdAccountReceivableUseCase;
  let repository: jest.Mocked<IAccountReceivableRepository>;
  let installmentRepository: jest.Mocked<IInstallmentRepository>;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      updateValorRecebido: jest.fn(),
    } as any;

    installmentRepository = {
      findByOrigemId: jest.fn(),
    } as any;

    useCase = new GetByIdAccountReceivableUseCase(repository, installmentRepository);
  });

  it('should return account receivable with installment summary when found', async () => {
    const account = {
      id: 'uuid-1',
      pessoaId: 'pessoa-uuid',
      numeroDocumento: 'NF-001',
      descricao: 'Venda de produtos',
      categoriaFinanceiraId: 'cat-uuid',
      dataEmissao: new Date('2024-01-01'),
      dataVencimento: new Date('2024-02-01'),
      valor: 3000,
      valorRecebido: 0,
      status: 'PENDENTE',
      createdAt: new Date(),
    };

    const parcelas = [
      { id: 'p1', valor: 1000, valorPago: 1000, status: 'PAGO', numeroParcela: 1 },
      { id: 'p2', valor: 1000, valorPago: 0, status: 'PENDENTE', numeroParcela: 2 },
      { id: 'p3', valor: 1000, valorPago: 0, status: 'PENDENTE', numeroParcela: 3 },
    ];

    repository.findById.mockResolvedValue(account as any);
    installmentRepository.findByOrigemId.mockResolvedValue(parcelas as any);

    const result = await useCase.execute({ id: 'uuid-1' });

    expect(result.conta).toEqual(account);
    expect(result.parcelamento).toEqual({
      valorTotal: 3000,
      quantidadeTotal: 3,
      quantidadePagas: 1,
      valorTotalPago: 1000,
      valorRestante: 2000,
    });
    expect(repository.findById).toHaveBeenCalledWith('uuid-1');
    expect(installmentRepository.findByOrigemId).toHaveBeenCalledWith('uuid-1');
  });

  it('should return zeroed summary when no installments exist', async () => {
    const account = {
      id: 'uuid-1',
      pessoaId: 'pessoa-uuid',
      numeroDocumento: 'NF-002',
      descricao: 'Serviço prestado',
      categoriaFinanceiraId: 'cat-uuid',
      dataEmissao: new Date('2024-01-01'),
      dataVencimento: new Date('2024-02-01'),
      valor: 500,
      valorRecebido: 0,
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
      numeroDocumento: 'NF-003',
      descricao: 'Venda com cancelamento',
      categoriaFinanceiraId: 'cat-uuid',
      dataEmissao: new Date('2024-01-01'),
      dataVencimento: new Date('2024-02-01'),
      valor: 2000,
      valorRecebido: 0,
      status: 'PENDENTE',
      createdAt: new Date(),
    };

    const parcelas = [
      { id: 'p1', valor: 1000, valorPago: 1000, status: 'PAGO', numeroParcela: 1 },
      { id: 'p2', valor: 1000, valorPago: 0, status: 'PENDENTE', numeroParcela: 2 },
      { id: 'p3', valor: 500, valorPago: 0, status: 'CANCELADO', numeroParcela: 3 },
    ];

    repository.findById.mockResolvedValue(account as any);
    installmentRepository.findByOrigemId.mockResolvedValue(parcelas as any);

    const result = await useCase.execute({ id: 'uuid-1' });

    expect(result.parcelamento).toEqual({
      valorTotal: 2000,
      quantidadeTotal: 2,
      quantidadePagas: 1,
      valorTotalPago: 1000,
      valorRestante: 1000,
    });
  });

  it('should throw 404 when account receivable is not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: 'non-existent-id' })).rejects.toThrow(
      new HttpException('Conta a receber não encontrada', HttpStatus.NOT_FOUND),
    );
    expect(repository.findById).toHaveBeenCalledWith('non-existent-id');
  });
});
