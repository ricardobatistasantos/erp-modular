import { NotFoundException } from '@nestjs/common';
import { DeleteSupplierUseCase } from '../../src/application/use-cases/delete-supplier.use-case';
import { ISupplierRepository } from '../../src/domain/repository/supplier.interface.repository';

describe('DeleteSupplierUseCase', () => {
  let useCase: DeleteSupplierUseCase;
  let repository: jest.Mocked<ISupplierRepository>;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new DeleteSupplierUseCase(repository);
  });

  it('should call delete when supplier exists', async () => {
    const supplierId = 'valid-uuid-123';
    repository.findById.mockResolvedValue({
      id: supplierId,
      pessoa_id: 'pessoa-uuid',
      categoria: 'Materiais',
      prazo_entrega_dias: 10,
    });
    repository.delete.mockResolvedValue(undefined);

    await useCase.execute({ id: supplierId });

    expect(repository.findById).toHaveBeenCalledWith(supplierId);
    expect(repository.delete).toHaveBeenCalledWith(supplierId);
  });

  it('should throw NotFoundException when supplier not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: 'non-existent-id' })).rejects.toThrow(
      new NotFoundException('Fornecedor não encontrado'),
    );
    expect(repository.findById).toHaveBeenCalledWith('non-existent-id');
    expect(repository.delete).not.toHaveBeenCalled();
  });
});
