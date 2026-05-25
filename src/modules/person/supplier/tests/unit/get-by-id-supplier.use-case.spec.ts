import { NotFoundException } from '@nestjs/common';
import { GetByIdSupplierUseCase } from '../../src/application/use-cases/get-by-id-supplier.use-case';
import { ISupplierRepository } from '../../src/domain/repository/supplier.interface.repository';

describe('GetByIdSupplierUseCase', () => {
  let useCase: GetByIdSupplierUseCase;
  let repository: jest.Mocked<ISupplierRepository>;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new GetByIdSupplierUseCase(repository);
  });

  it('should return supplier data when found', async () => {
    const supplierData = {
      id: 'supplier-uuid-1',
      pessoa_id: 'pessoa-uuid-1',
      categoria: 'Matéria-prima',
      prazo_entrega_dias: 15,
      nome: 'Fornecedor Teste',
      email: 'fornecedor@teste.com',
      tipo: 'J',
    };

    repository.findById.mockResolvedValue(supplierData);

    const result = await useCase.execute({ id: 'supplier-uuid-1' });

    expect(result).toEqual(supplierData);
    expect(repository.findById).toHaveBeenCalledWith('supplier-uuid-1');
  });

  it('should throw NotFoundException when supplier is not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: 'non-existent-id' })).rejects.toThrow(
      new NotFoundException('Fornecedor não encontrado'),
    );
    expect(repository.findById).toHaveBeenCalledWith('non-existent-id');
  });
});
