import { FindAllAccountPayablesUseCase } from '../../src/application/use-cases/find-all-account-payables.use-case';
import { IAccountPayableRepository } from '../../src/domain/repository/account-payable.interface.repository';

describe('FindAllAccountPayablesUseCase', () => {
  let useCase: FindAllAccountPayablesUseCase;
  let repository: jest.Mocked<IAccountPayableRepository>;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      updateValorPago: jest.fn(),
    };

    useCase = new FindAllAccountPayablesUseCase(repository);
  });

  it('should return paginated results with default values', async () => {
    const mockData = [
      { id: 'uuid-1', descricao: 'Conta 1' },
      { id: 'uuid-2', descricao: 'Conta 2' },
    ];

    repository.findAll.mockResolvedValue({ data: mockData as any, total: 25 });

    const result = await useCase.execute({});

    expect(result).toEqual({
      data: mockData,
      meta: {
        total: 25,
        page: 1,
        limit: 10,
        totalPages: 3,
      },
    });
    expect(repository.findAll).toHaveBeenCalledWith(1, 10);
  });

  it('should use provided page and limit', async () => {
    repository.findAll.mockResolvedValue({ data: [], total: 50 });

    const result = await useCase.execute({ page: 3, limit: 20 });

    expect(result).toEqual({
      data: [],
      meta: {
        total: 50,
        page: 3,
        limit: 20,
        totalPages: 3,
      },
    });
    expect(repository.findAll).toHaveBeenCalledWith(3, 20);
  });

  it('should default page to 1 when not provided', async () => {
    repository.findAll.mockResolvedValue({ data: [], total: 0 });

    await useCase.execute({ limit: 5 });

    expect(repository.findAll).toHaveBeenCalledWith(1, 5);
  });

  it('should default limit to 10 when not provided', async () => {
    repository.findAll.mockResolvedValue({ data: [], total: 0 });

    await useCase.execute({ page: 2 });

    expect(repository.findAll).toHaveBeenCalledWith(2, 10);
  });

  it('should calculate totalPages correctly', async () => {
    repository.findAll.mockResolvedValue({ data: [], total: 1 });

    const result = await useCase.execute({ page: 1, limit: 10 });

    expect(result.meta.totalPages).toBe(1);
  });
});
