import { HttpException, HttpStatus } from '@nestjs/common';

import { CreateReservaEstoqueUseCase } from '../../src/application/use-cases/create-reserva-estoque.use-case';
import { IReservaEstoqueRepository } from '../../src/domain/repository/reserva-estoque.repository';
import { ISaldoEstoqueRepository } from '../../src/domain/repository/saldo-estoque.repository';
import { ReservaEstoque } from '../../src/domain/entity/reserva-estoque.entity';
import { SaldoEstoque } from '../../src/domain/entity/saldo-estoque.entity';
import { EstoqueOrigem } from '../../src/domain/enums/estoque-origem.enum';
import { StatusReservaEstoque } from '../../src/domain/enums/status-reserva-estoque.enum';
import { CreateReservaEstoqueDto } from '../../src/application/dto/create-reserva-estoque.dto';

describe('CreateReservaEstoqueUseCase', () => {
  let useCase: CreateReservaEstoqueUseCase;
  let reservaRepository: jest.Mocked<IReservaEstoqueRepository>;
  let saldoRepository: jest.Mocked<ISaldoEstoqueRepository>;
  let mockConnection: jest.Mock;
  let mockTx: jest.Mock;
  let mockTransaction: object;

  beforeEach(() => {
    reservaRepository = {
      create: jest.fn(),
      findByOrigem: jest.fn(),
      updateStatus: jest.fn(),
    };

    saldoRepository = {
      upsert: jest.fn(),
      findByProdutoId: jest.fn(),
      findByDepositoId: jest.fn(),
      findByProdutoAndDeposito: jest.fn(),
    };

    mockTransaction = {};
    mockTx = jest.fn((callback) => callback(mockTransaction));
    mockConnection = jest.fn(() => ({ tx: mockTx }));

    useCase = new CreateReservaEstoqueUseCase(
      reservaRepository,
      saldoRepository,
      mockConnection,
    );
  });

  const makeDto = (overrides?: Partial<CreateReservaEstoqueDto>): CreateReservaEstoqueDto => ({
    produtoId: 'produto-001',
    depositoId: 'deposito-001',
    origem: EstoqueOrigem.VENDA,
    origemId: 'pedido-001',
    quantidade: 5,
    ...overrides,
  });

  const makeSaldo = (overrides?: Partial<SaldoEstoque>): SaldoEstoque =>
    new SaldoEstoque({
      id: 'saldo-001',
      produtoId: 'produto-001',
      depositoId: 'deposito-001',
      saldoQuantidade: 100,
      reservado: 0,
      custoMedio: 20.0,
      updatedAt: new Date(),
      ...overrides,
    });

  describe('Criação da reserva', () => {
    it('deve criar uma reserva de estoque com status RESERVADO', async () => {
      const dto = makeDto();
      const saldo = makeSaldo();

      saldoRepository.findByProdutoAndDeposito.mockResolvedValue(saldo);
      reservaRepository.create.mockImplementation(async (r) => r);
      saldoRepository.upsert.mockImplementation(async (s) => s);

      const result = await useCase.execute(dto);

      expect(result).toBeInstanceOf(ReservaEstoque);
      expect(result.produtoId).toBe('produto-001');
      expect(result.depositoId).toBe('deposito-001');
      expect(result.origem).toBe(EstoqueOrigem.VENDA);
      expect(result.origemId).toBe('pedido-001');
      expect(result.quantidade).toBe(5);
      expect(result.status).toBe(StatusReservaEstoque.RESERVADO);
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it('deve chamar reservaRepository.create com a reserva e a transação', async () => {
      const dto = makeDto();
      const saldo = makeSaldo();

      saldoRepository.findByProdutoAndDeposito.mockResolvedValue(saldo);
      reservaRepository.create.mockImplementation(async (r) => r);
      saldoRepository.upsert.mockImplementation(async (s) => s);

      await useCase.execute(dto);

      expect(reservaRepository.create).toHaveBeenCalledTimes(1);
      expect(reservaRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          produtoId: 'produto-001',
          depositoId: 'deposito-001',
          origem: EstoqueOrigem.VENDA,
          origemId: 'pedido-001',
          quantidade: 5,
          status: StatusReservaEstoque.RESERVADO,
        }),
        mockTransaction,
      );
    });
  });

  describe('Validação de saldo disponível', () => {
    it('deve lançar erro quando saldo não existe para produto/depósito', async () => {
      const dto = makeDto();

      saldoRepository.findByProdutoAndDeposito.mockResolvedValue(null);

      await expect(useCase.execute(dto)).rejects.toThrow(HttpException);
      await expect(useCase.execute(dto)).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('deve lançar erro quando saldo disponível é insuficiente', async () => {
      const dto = makeDto({ quantidade: 50 });
      const saldo = makeSaldo({ saldoQuantidade: 100, reservado: 60 }); // disponível = 40

      saldoRepository.findByProdutoAndDeposito.mockResolvedValue(saldo);

      await expect(useCase.execute(dto)).rejects.toThrow(HttpException);
      await expect(useCase.execute(dto)).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('deve lançar erro quando quantidade solicitada é igual ao disponível + 1', async () => {
      const dto = makeDto({ quantidade: 11 });
      const saldo = makeSaldo({ saldoQuantidade: 20, reservado: 10 }); // disponível = 10

      saldoRepository.findByProdutoAndDeposito.mockResolvedValue(saldo);

      await expect(useCase.execute(dto)).rejects.toThrow(HttpException);
    });

    it('deve permitir reserva quando quantidade é exatamente igual ao disponível', async () => {
      const dto = makeDto({ quantidade: 10 });
      const saldo = makeSaldo({ saldoQuantidade: 20, reservado: 10 }); // disponível = 10

      saldoRepository.findByProdutoAndDeposito.mockResolvedValue(saldo);
      reservaRepository.create.mockImplementation(async (r) => r);
      saldoRepository.upsert.mockImplementation(async (s) => s);

      const result = await useCase.execute(dto);

      expect(result).toBeInstanceOf(ReservaEstoque);
      expect(result.quantidade).toBe(10);
    });

    it('não deve chamar reservaRepository.create quando saldo é insuficiente', async () => {
      const dto = makeDto({ quantidade: 200 });
      const saldo = makeSaldo({ saldoQuantidade: 100, reservado: 0 });

      saldoRepository.findByProdutoAndDeposito.mockResolvedValue(saldo);

      await expect(useCase.execute(dto)).rejects.toThrow();
      expect(reservaRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('Atualização do saldo reservado', () => {
    it('deve incrementar o campo reservado no saldo', async () => {
      const dto = makeDto({ quantidade: 5 });
      const saldo = makeSaldo({ saldoQuantidade: 100, reservado: 10 });

      saldoRepository.findByProdutoAndDeposito.mockResolvedValue(saldo);
      reservaRepository.create.mockImplementation(async (r) => r);
      saldoRepository.upsert.mockImplementation(async (s) => s);

      await useCase.execute(dto);

      expect(saldoRepository.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          reservado: 15,
        }),
        mockTransaction,
      );
    });

    it('deve atualizar updatedAt no saldo', async () => {
      const dto = makeDto();
      const oldDate = new Date('2020-01-01');
      const saldo = makeSaldo({ updatedAt: oldDate });

      saldoRepository.findByProdutoAndDeposito.mockResolvedValue(saldo);
      reservaRepository.create.mockImplementation(async (r) => r);
      saldoRepository.upsert.mockImplementation(async (s) => s);

      await useCase.execute(dto);

      const upsertedSaldo = saldoRepository.upsert.mock.calls[0][0];
      expect(upsertedSaldo.updatedAt.getTime()).toBeGreaterThan(oldDate.getTime());
    });

    it('deve manter saldoQuantidade inalterado após reserva', async () => {
      const dto = makeDto({ quantidade: 5 });
      const saldo = makeSaldo({ saldoQuantidade: 100, reservado: 0 });

      saldoRepository.findByProdutoAndDeposito.mockResolvedValue(saldo);
      reservaRepository.create.mockImplementation(async (r) => r);
      saldoRepository.upsert.mockImplementation(async (s) => s);

      await useCase.execute(dto);

      expect(saldoRepository.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          saldoQuantidade: 100,
          reservado: 5,
        }),
        mockTransaction,
      );
    });

    it('deve chamar saldoRepository.upsert após criar a reserva', async () => {
      const dto = makeDto();
      const saldo = makeSaldo();

      saldoRepository.findByProdutoAndDeposito.mockResolvedValue(saldo);
      reservaRepository.create.mockImplementation(async (r) => r);
      saldoRepository.upsert.mockImplementation(async (s) => s);

      await useCase.execute(dto);

      expect(saldoRepository.upsert).toHaveBeenCalledTimes(1);
    });
  });

  describe('Orquestração transacional', () => {
    it('deve executar todas as operações dentro de connection().tx()', async () => {
      const dto = makeDto();
      const saldo = makeSaldo();

      saldoRepository.findByProdutoAndDeposito.mockResolvedValue(saldo);
      reservaRepository.create.mockImplementation(async (r) => r);
      saldoRepository.upsert.mockImplementation(async (s) => s);

      await useCase.execute(dto);

      expect(mockConnection).toHaveBeenCalledTimes(1);
      expect(mockTx).toHaveBeenCalledTimes(1);
    });

    it('deve passar a transação para saldoRepository.findByProdutoAndDeposito', async () => {
      const dto = makeDto();
      const saldo = makeSaldo();

      saldoRepository.findByProdutoAndDeposito.mockResolvedValue(saldo);
      reservaRepository.create.mockImplementation(async (r) => r);
      saldoRepository.upsert.mockImplementation(async (s) => s);

      await useCase.execute(dto);

      expect(saldoRepository.findByProdutoAndDeposito).toHaveBeenCalledWith(
        dto.produtoId,
        dto.depositoId,
        mockTransaction,
      );
    });

    it('deve passar a transação para reservaRepository.create', async () => {
      const dto = makeDto();
      const saldo = makeSaldo();

      saldoRepository.findByProdutoAndDeposito.mockResolvedValue(saldo);
      reservaRepository.create.mockImplementation(async (r) => r);
      saldoRepository.upsert.mockImplementation(async (s) => s);

      await useCase.execute(dto);

      expect(reservaRepository.create).toHaveBeenCalledWith(
        expect.any(ReservaEstoque),
        mockTransaction,
      );
    });

    it('deve passar a transação para saldoRepository.upsert', async () => {
      const dto = makeDto();
      const saldo = makeSaldo();

      saldoRepository.findByProdutoAndDeposito.mockResolvedValue(saldo);
      reservaRepository.create.mockImplementation(async (r) => r);
      saldoRepository.upsert.mockImplementation(async (s) => s);

      await useCase.execute(dto);

      expect(saldoRepository.upsert).toHaveBeenCalledWith(
        expect.any(SaldoEstoque),
        mockTransaction,
      );
    });
  });
});
