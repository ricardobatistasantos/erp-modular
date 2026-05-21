import { HttpException, HttpStatus } from '@nestjs/common';
import { CreatePaymentMethodUseCase } from '../../src/application/use-cases/create-payment-method.use-case';
import { IPaymentMethodRepository } from '../../src/domain/repository/payment-method.interface.repository';

describe('CreatePaymentMethodUseCase', () => {
  let useCase: CreatePaymentMethodUseCase;
  let repository: jest.Mocked<IPaymentMethodRepository>;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
    };

    useCase = new CreatePaymentMethodUseCase(repository);
  });

  it('should create a payment method with valid data', async () => {
    const input = { nome: 'Cartão de Crédito', descricao: 'Pagamento via cartão' };
    const expected = { id: 'uuid-1', nome: 'Cartão de Crédito', descricao: 'Pagamento via cartão', ativo: true };

    repository.create.mockResolvedValue(expected);

    const result = await useCase.execute(input);

    expect(result).toEqual(expected);
    expect(repository.create).toHaveBeenCalledWith(input);
  });

  it('should throw 400 when nome is missing', async () => {
    const input = { nome: '', descricao: 'Sem nome' };

    await expect(useCase.execute(input)).rejects.toThrow(
      new HttpException('O campo nome é obrigatório', HttpStatus.BAD_REQUEST),
    );
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('should throw 400 when nome is only whitespace', async () => {
    const input = { nome: '   ', descricao: 'Apenas espaços' };

    await expect(useCase.execute(input)).rejects.toThrow(
      new HttpException('O campo nome é obrigatório', HttpStatus.BAD_REQUEST),
    );
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('should throw 400 when nome is null/undefined', async () => {
    const input = { nome: undefined as any };

    await expect(useCase.execute(input)).rejects.toThrow(
      new HttpException('O campo nome é obrigatório', HttpStatus.BAD_REQUEST),
    );
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('should create a payment method without descricao', async () => {
    const input = { nome: 'PIX' };
    const expected = { id: 'uuid-2', nome: 'PIX', descricao: undefined, ativo: true };

    repository.create.mockResolvedValue(expected);

    const result = await useCase.execute(input);

    expect(result).toEqual(expected);
    expect(repository.create).toHaveBeenCalledWith(input);
  });
});
