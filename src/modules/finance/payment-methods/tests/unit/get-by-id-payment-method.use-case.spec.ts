import { HttpException, HttpStatus } from '@nestjs/common';
import { GetByIdPaymentMethodUseCase } from '../../src/application/use-cases/get-by-id-payment-method.use-case';
import { IPaymentMethodRepository } from '../../src/domain/repository/payment-method.interface.repository';

describe('GetByIdPaymentMethodUseCase', () => {
  let useCase: GetByIdPaymentMethodUseCase;
  let repository: jest.Mocked<IPaymentMethodRepository>;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
    };

    useCase = new GetByIdPaymentMethodUseCase(repository);
  });

  it('should return a payment method when found', async () => {
    const expected = { id: 'uuid-1', nome: 'PIX', descricao: 'Pagamento instantâneo', ativo: true };

    repository.findById.mockResolvedValue(expected);

    const result = await useCase.execute({ id: 'uuid-1' });

    expect(result).toEqual(expected);
    expect(repository.findById).toHaveBeenCalledWith('uuid-1');
  });

  it('should throw 404 when payment method is not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: 'non-existent-id' })).rejects.toThrow(
      new HttpException('Forma de pagamento não encontrada', HttpStatus.NOT_FOUND),
    );
  });
});
