import { FindAllPaymentMethodsUseCase } from '../../src/application/use-cases/find-all-payment-methods.use-case';
import { IPaymentMethodRepository } from '../../src/domain/repository/payment-method.interface.repository';

describe('FindAllPaymentMethodsUseCase', () => {
  let useCase: FindAllPaymentMethodsUseCase;
  let repository: jest.Mocked<IPaymentMethodRepository>;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
    };

    useCase = new FindAllPaymentMethodsUseCase(repository);
  });

  it('should return paginated results with default values', async () => {
    const mockData = [
      { id: 'uuid-1', nome: 'PIX', descricao: null, ativo: true },
      { id: 'uuid-2', nome: 'Boleto', descricao: 'Boleto bancário', ativo: true },
    ];

    repository.findAll.mockResolvedValue({ data: mockData, total: 2 });

    const result = await useCase.execute({});

    expect(result).toEqual({
      data: mockData,
      meta: {
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    });
    expect(repository.findAll).toHaveBeenCalledWith(1, 10);
  });

  it('should use provided page and limit values', async () => {
    repository.findAll.mockResolvedValue({ data: [], total: 25 });

    const result = await useCase.execute({ page: 3, limit: 5 });

    expect(result).toEqual({
      data: [],
      meta: {
        total: 25,
        page: 3,
        limit: 5,
        totalPages: 5,
      },
    });
    expect(repository.findAll).toHaveBeenCalledWith(3, 5);
  });

  it('should apply default page=1 when not provided', async () => {
    repository.findAll.mockResolvedValue({ data: [], total: 0 });

    await useCase.execute({ limit: 20 });

    expect(repository.findAll).toHaveBeenCalledWith(1, 20);
  });

  it('should apply default limit=10 when not provided', async () => {
    repository.findAll.mockResolvedValue({ data: [], total: 0 });

    await useCase.execute({ page: 2 });

    expect(repository.findAll).toHaveBeenCalledWith(2, 10);
  });

  it('should calculate totalPages correctly', async () => {
    repository.findAll.mockResolvedValue({ data: [], total: 23 });

    const result = await useCase.execute({ page: 1, limit: 10 });

    expect(result.meta.totalPages).toBe(3);
  });
});
