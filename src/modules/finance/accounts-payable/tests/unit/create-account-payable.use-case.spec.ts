import { HttpException, HttpStatus } from '@nestjs/common';
import { CreateAccountPayableUseCase } from '../../src/application/use-cases/create-account-payable.use-case';
import { IAccountPayableRepository } from '../../src/domain/repository/account-payable.interface.repository';

describe('CreateAccountPayableUseCase', () => {
  let useCase: CreateAccountPayableUseCase;
  let repository: jest.Mocked<IAccountPayableRepository>;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      updateValorPago: jest.fn(),
    };

    useCase = new CreateAccountPayableUseCase(repository);
  });

  it('should create an account payable with valid data', async () => {
    const input = {
      pessoaId: 'pessoa-uuid',
      numeroDocumento: 'NF-001',
      descricao: 'Compra de materiais',
      categoriaFinanceiraId: 'cat-uuid',
      dataEmissao: new Date('2024-01-01'),
      dataVencimento: new Date('2024-02-01'),
      valor: 1500.50,
    };
    const expected = {
      id: 'uuid-1',
      ...input,
      valorPago: 0,
      status: 'PENDENTE',
      createdAt: new Date(),
    };

    repository.create.mockResolvedValue(expected as any);

    const result = await useCase.execute(input);

    expect(result).toEqual(expected);
    expect(repository.create).toHaveBeenCalledWith(input);
  });

  it('should throw 400 when required fields are missing', async () => {
    const input = {
      pessoaId: '',
      numeroDocumento: 'NF-001',
      descricao: 'Compra',
      categoriaFinanceiraId: 'cat-uuid',
      dataEmissao: new Date('2024-01-01'),
      dataVencimento: new Date('2024-02-01'),
      valor: 100,
    };

    await expect(useCase.execute(input)).rejects.toThrow(HttpException);
    await expect(useCase.execute(input)).rejects.toMatchObject({
      status: HttpStatus.BAD_REQUEST,
    });
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('should throw 400 when valor is zero', async () => {
    const input = {
      pessoaId: 'pessoa-uuid',
      numeroDocumento: 'NF-001',
      descricao: 'Compra',
      categoriaFinanceiraId: 'cat-uuid',
      dataEmissao: new Date('2024-01-01'),
      dataVencimento: new Date('2024-02-01'),
      valor: 0,
    };

    await expect(useCase.execute(input)).rejects.toThrow(HttpException);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('should throw 400 when valor is negative', async () => {
    const input = {
      pessoaId: 'pessoa-uuid',
      numeroDocumento: 'NF-001',
      descricao: 'Compra',
      categoriaFinanceiraId: 'cat-uuid',
      dataEmissao: new Date('2024-01-01'),
      dataVencimento: new Date('2024-02-01'),
      valor: -100,
    };

    await expect(useCase.execute(input)).rejects.toThrow(HttpException);
    expect(repository.create).not.toHaveBeenCalled();
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
    const expected = { id: 'uuid-1', ...input, valorPago: 0, status: 'PENDENTE', createdAt: new Date() };

    repository.create.mockResolvedValue(expected as any);

    const result = await useCase.execute(input);

    expect(result).toEqual(expected);
    expect(repository.create).toHaveBeenCalledWith(input);
  });
});
