import { HttpException, HttpStatus } from '@nestjs/common';
import { GetByIdAccountPayableUseCase } from '../../src/application/use-cases/get-by-id-account-payable.use-case';
import { IAccountPayableRepository } from '../../src/domain/repository/account-payable.interface.repository';

describe('GetByIdAccountPayableUseCase', () => {
  let useCase: GetByIdAccountPayableUseCase;
  let repository: jest.Mocked<IAccountPayableRepository>;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      updateValorPago: jest.fn(),
    };

    useCase = new GetByIdAccountPayableUseCase(repository);
  });

  it('should return account payable when found', async () => {
    const expected = {
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

    repository.findById.mockResolvedValue(expected as any);

    const result = await useCase.execute({ id: 'uuid-1' });

    expect(result).toEqual(expected);
    expect(repository.findById).toHaveBeenCalledWith('uuid-1');
  });

  it('should throw 404 when account payable is not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: 'non-existent-id' })).rejects.toThrow(
      new HttpException('Conta a pagar não encontrada', HttpStatus.NOT_FOUND),
    );
    expect(repository.findById).toHaveBeenCalledWith('non-existent-id');
  });
});
