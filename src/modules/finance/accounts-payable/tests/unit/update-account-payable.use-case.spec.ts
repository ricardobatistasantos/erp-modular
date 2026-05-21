import { HttpException, HttpStatus } from '@nestjs/common';
import { UpdateAccountPayableUseCase } from '../../src/application/use-cases/update-account-payable.use-case';
import { IAccountPayableRepository } from '../../src/domain/repository/account-payable.interface.repository';

describe('UpdateAccountPayableUseCase', () => {
  let useCase: UpdateAccountPayableUseCase;
  let repository: jest.Mocked<IAccountPayableRepository>;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      updateValorPago: jest.fn(),
    };

    useCase = new UpdateAccountPayableUseCase(repository);
  });

  it('should update account payable when it exists', async () => {
    const existing = {
      id: 'uuid-1',
      pessoaId: 'pessoa-uuid',
      numeroDocumento: 'NF-001',
      descricao: 'Compra original',
      categoriaFinanceiraId: 'cat-uuid',
      dataEmissao: new Date('2024-01-01'),
      dataVencimento: new Date('2024-02-01'),
      valor: 1000,
      valorPago: 0,
      status: 'PENDENTE',
      createdAt: new Date(),
    };
    const updateData = { descricao: 'Compra atualizada' };
    const updated = { ...existing, ...updateData, updatedAt: new Date() };

    repository.findById.mockResolvedValue(existing as any);
    repository.update.mockResolvedValue(updated as any);

    const result = await useCase.execute({ id: 'uuid-1', data: updateData });

    expect(result).toEqual(updated);
    expect(repository.findById).toHaveBeenCalledWith('uuid-1');
    expect(repository.update).toHaveBeenCalledWith('uuid-1', updateData);
  });

  it('should throw 404 when account payable does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ id: 'non-existent', data: { descricao: 'Test' } }),
    ).rejects.toThrow(
      new HttpException('Conta a pagar não encontrada', HttpStatus.NOT_FOUND),
    );
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('should throw 400 when dataVencimento is before dataEmissao', async () => {
    const existing = {
      id: 'uuid-1',
      pessoaId: 'pessoa-uuid',
      numeroDocumento: 'NF-001',
      descricao: 'Compra',
      categoriaFinanceiraId: 'cat-uuid',
      dataEmissao: new Date('2024-01-01'),
      dataVencimento: new Date('2024-02-01'),
      valor: 1000,
      valorPago: 0,
      status: 'PENDENTE',
      createdAt: new Date(),
    };

    repository.findById.mockResolvedValue(existing as any);

    await expect(
      useCase.execute({
        id: 'uuid-1',
        data: {
          dataEmissao: new Date('2024-06-01'),
          dataVencimento: new Date('2024-03-01'),
        },
      }),
    ).rejects.toThrow(
      new HttpException(
        'A data de vencimento deve ser igual ou posterior à data de emissão',
        HttpStatus.BAD_REQUEST,
      ),
    );
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('should allow update when only one date is provided', async () => {
    const existing = {
      id: 'uuid-1',
      pessoaId: 'pessoa-uuid',
      numeroDocumento: 'NF-001',
      descricao: 'Compra',
      categoriaFinanceiraId: 'cat-uuid',
      dataEmissao: new Date('2024-01-01'),
      dataVencimento: new Date('2024-02-01'),
      valor: 1000,
      valorPago: 0,
      status: 'PENDENTE',
      createdAt: new Date(),
    };
    const updateData = { dataVencimento: new Date('2024-05-01') };

    repository.findById.mockResolvedValue(existing as any);
    repository.update.mockResolvedValue({ ...existing, ...updateData } as any);

    const result = await useCase.execute({ id: 'uuid-1', data: updateData });

    expect(result).toBeDefined();
    expect(repository.update).toHaveBeenCalledWith('uuid-1', updateData);
  });

  it('should accept when dataVencimento equals dataEmissao in update', async () => {
    const existing = {
      id: 'uuid-1',
      pessoaId: 'pessoa-uuid',
      numeroDocumento: 'NF-001',
      descricao: 'Compra',
      categoriaFinanceiraId: 'cat-uuid',
      dataEmissao: new Date('2024-01-01'),
      dataVencimento: new Date('2024-02-01'),
      valor: 1000,
      valorPago: 0,
      status: 'PENDENTE',
      createdAt: new Date(),
    };
    const updateData = {
      dataEmissao: new Date('2024-04-01'),
      dataVencimento: new Date('2024-04-01'),
    };

    repository.findById.mockResolvedValue(existing as any);
    repository.update.mockResolvedValue({ ...existing, ...updateData } as any);

    const result = await useCase.execute({ id: 'uuid-1', data: updateData });

    expect(result).toBeDefined();
    expect(repository.update).toHaveBeenCalledWith('uuid-1', updateData);
  });
});
