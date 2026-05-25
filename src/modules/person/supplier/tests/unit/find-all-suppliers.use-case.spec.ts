import { FindAllSuppliersUseCase } from '../../src/application/use-cases/find-all-suppliers.use-case';
import { ISupplierRepository } from '../../src/domain/repository/supplier.interface.repository';

describe('FindAllSuppliersUseCase', () => {
  let useCase: FindAllSuppliersUseCase;
  let repository: jest.Mocked<ISupplierRepository>;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new FindAllSuppliersUseCase(repository);
  });

  it('should default to page=1 and limit=10 when called with empty object', async () => {
    const mockData = [
      { id: 'uuid-1', categoria: 'Matéria-prima', nome: 'Fornecedor A' },
      { id: 'uuid-2', categoria: 'Serviços', nome: 'Fornecedor B' },
    ];

    repository.findAll.mockResolvedValue({ data: mockData as any, total: 2 });

    const result = await useCase.execute({});

    expect(repository.findAll).toHaveBeenCalledWith(1, 10);
    expect(result.meta.page).toBe(1);
    expect(result.meta.limit).toBe(10);
  });

  it('should return correct meta with totalPages calculation', async () => {
    const mockData = Array.from({ length: 10 }, (_, i) => ({
      id: `uuid-${i}`,
      categoria: 'Categoria',
      nome: `Fornecedor ${i}`,
    }));

    repository.findAll.mockResolvedValue({ data: mockData as any, total: 25 });

    const result = await useCase.execute({ page: 1, limit: 10 });

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

  it('should return empty data array when no results', async () => {
    repository.findAll.mockResolvedValue({ data: [], total: 0 });

    const result = await useCase.execute({});

    expect(result).toEqual({
      data: [],
      meta: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },
    });
  });
});
