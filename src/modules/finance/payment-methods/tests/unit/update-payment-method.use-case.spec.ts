import { HttpException, HttpStatus } from '@nestjs/common';
import { UpdatePaymentMethodUseCase } from '../../src/application/use-cases/update-payment-method.use-case';
import { IPaymentMethodRepository } from '../../src/domain/repository/payment-method.interface.repository';

describe('UpdatePaymentMethodUseCase', () => {
  let useCase: UpdatePaymentMethodUseCase;
  let repository: jest.Mocked<IPaymentMethodRepository>;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
    };

    useCase = new UpdatePaymentMethodUseCase(repository);
  });

  it('should update a payment method when it exists', async () => {
    const existing = { id: 'uuid-1', nome: 'PIX', descricao: 'Pagamento instantâneo', ativo: true };
    const updated = { id: 'uuid-1', nome: 'PIX Atualizado', descricao: 'Pagamento instantâneo', ativo: true };

    repository.findById.mockResolvedValue(existing);
    repository.update.mockResolvedValue(updated);

    const result = await useCase.execute({ id: 'uuid-1', data: { nome: 'PIX Atualizado' } });

    expect(result).toEqual(updated);
    expect(repository.findById).toHaveBeenCalledWith('uuid-1');
    expect(repository.update).toHaveBeenCalledWith('uuid-1', { nome: 'PIX Atualizado' });
  });

  it('should throw 404 when payment method does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ id: 'non-existent-id', data: { nome: 'Novo Nome' } }),
    ).rejects.toThrow(
      new HttpException('Forma de pagamento não encontrada', HttpStatus.NOT_FOUND),
    );
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('should allow partial update with only descricao', async () => {
    const existing = { id: 'uuid-1', nome: 'PIX', descricao: null, ativo: true };
    const updated = { id: 'uuid-1', nome: 'PIX', descricao: 'Nova descrição', ativo: true };

    repository.findById.mockResolvedValue(existing);
    repository.update.mockResolvedValue(updated);

    const result = await useCase.execute({ id: 'uuid-1', data: { descricao: 'Nova descrição' } });

    expect(result).toEqual(updated);
    expect(repository.update).toHaveBeenCalledWith('uuid-1', { descricao: 'Nova descrição' });
  });

  it('should allow updating ativo field', async () => {
    const existing = { id: 'uuid-1', nome: 'Boleto', descricao: null, ativo: true };
    const updated = { id: 'uuid-1', nome: 'Boleto', descricao: null, ativo: false };

    repository.findById.mockResolvedValue(existing);
    repository.update.mockResolvedValue(updated);

    const result = await useCase.execute({ id: 'uuid-1', data: { ativo: false } });

    expect(result).toEqual(updated);
    expect(repository.update).toHaveBeenCalledWith('uuid-1', { ativo: false });
  });
});
