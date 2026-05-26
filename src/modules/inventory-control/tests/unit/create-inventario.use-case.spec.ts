import { CreateInventarioUseCase } from '../../src/application/use-cases/create-inventario.use-case';
import { IInventarioRepository } from '../../src/domain/repository/inventario.repository';
import { ISaldoEstoqueRepository } from '../../src/domain/repository/saldo-estoque.repository';
import { Inventario } from '../../src/domain/entity/inventario.entity';
import { InventarioItem } from '../../src/domain/entity/inventario-item.entity';
import { SaldoEstoque } from '../../src/domain/entity/saldo-estoque.entity';
import { CreateInventarioDto } from '../../src/application/dto/create-inventario.dto';

describe('CreateInventarioUseCase', () => {
  let useCase: CreateInventarioUseCase;
  let inventarioRepository: jest.Mocked<IInventarioRepository>;
  let saldoRepository: jest.Mocked<ISaldoEstoqueRepository>;
  let mockTransaction: any;
  let mockConnection: any;

  beforeEach(() => {
    inventarioRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      finalize: jest.fn(),
      update: jest.fn(),
      createItem: jest.fn(),
      findItensByInventarioId: jest.fn(),
      updateItem: jest.fn(),
    };

    saldoRepository = {
      upsert: jest.fn(),
      findByProdutoId: jest.fn(),
      findByDepositoId: jest.fn(),
      findByProdutoAndDeposito: jest.fn(),
    };

    mockTransaction = {};
    mockConnection = jest.fn().mockReturnValue({
      tx: jest.fn((callback) => callback(mockTransaction)),
    });

    useCase = new CreateInventarioUseCase(
      inventarioRepository,
      saldoRepository,
      mockConnection,
    );
  });

  const makeDto = (overrides?: Partial<CreateInventarioDto>): CreateInventarioDto => ({
    depositoId: 'deposito-001',
    ...overrides,
  });

  const makeSaldo = (overrides?: Partial<SaldoEstoque>): SaldoEstoque =>
    new SaldoEstoque({
      id: 'saldo-001',
      produtoId: 'produto-001',
      depositoId: 'deposito-001',
      saldoQuantidade: 50,
      reservado: 5,
      custoMedio: 10.0,
      updatedAt: new Date(),
      ...overrides,
    });

  describe('Criação do inventário', () => {
    it('deve criar um inventário com status ABERTO', async () => {
      const dto = makeDto();

      inventarioRepository.create.mockImplementation(async (inv) => inv);
      saldoRepository.findByDepositoId.mockResolvedValue([]);

      const result = await useCase.execute(dto);

      expect(result).toBeInstanceOf(Inventario);
      expect(result.depositoId).toBe('deposito-001');
      expect(result.status).toBe('ABERTO');
      expect(result.id).toBeDefined();
      expect(result.iniciadoEm).toBeInstanceOf(Date);
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it('deve chamar inventarioRepository.create com o inventário', async () => {
      const dto = makeDto();

      inventarioRepository.create.mockImplementation(async (inv) => inv);
      saldoRepository.findByDepositoId.mockResolvedValue([]);

      await useCase.execute(dto);

      expect(inventarioRepository.create).toHaveBeenCalledTimes(1);
      expect(inventarioRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          depositoId: 'deposito-001',
          status: 'ABERTO',
        }),
        mockTransaction,
      );
    });

    it('deve retornar o inventário criado pelo repositório', async () => {
      const dto = makeDto();

      inventarioRepository.create.mockImplementation(async (inv) => inv);
      saldoRepository.findByDepositoId.mockResolvedValue([]);

      const result = await useCase.execute(dto);

      expect(result.depositoId).toBe(dto.depositoId);
      expect(result.status).toBe('ABERTO');
    });
  });

  describe('Carregamento de saldos e criação de itens', () => {
    it('deve buscar saldos do depósito via saldoRepository.findByDepositoId', async () => {
      const dto = makeDto();

      inventarioRepository.create.mockImplementation(async (inv) => inv);
      saldoRepository.findByDepositoId.mockResolvedValue([]);

      await useCase.execute(dto);

      expect(saldoRepository.findByDepositoId).toHaveBeenCalledWith('deposito-001', mockTransaction);
    });

    it('deve criar um InventarioItem para cada saldo encontrado', async () => {
      const dto = makeDto();
      const saldos = [
        makeSaldo({ id: 'saldo-001', produtoId: 'produto-001', saldoQuantidade: 50 }),
        makeSaldo({ id: 'saldo-002', produtoId: 'produto-002', saldoQuantidade: 30 }),
        makeSaldo({ id: 'saldo-003', produtoId: 'produto-003', saldoQuantidade: 10 }),
      ];

      inventarioRepository.create.mockImplementation(async (inv) => inv);
      inventarioRepository.createItem.mockImplementation(async (item) => item);
      saldoRepository.findByDepositoId.mockResolvedValue(saldos);

      await useCase.execute(dto);

      expect(inventarioRepository.createItem).toHaveBeenCalledTimes(3);
    });

    it('deve criar itens com saldoSistema igual ao saldoQuantidade do saldo', async () => {
      const dto = makeDto();
      const saldos = [
        makeSaldo({ produtoId: 'produto-001', saldoQuantidade: 75 }),
      ];

      inventarioRepository.create.mockImplementation(async (inv) => inv);
      inventarioRepository.createItem.mockImplementation(async (item) => item);
      saldoRepository.findByDepositoId.mockResolvedValue(saldos);

      await useCase.execute(dto);

      expect(inventarioRepository.createItem).toHaveBeenCalledWith(
        expect.objectContaining({
          produtoId: 'produto-001',
          saldoSistema: 75,
          saldoFisico: 0,
        }),
        mockTransaction,
      );
    });

    it('deve criar itens com saldoFisico = 0', async () => {
      const dto = makeDto();
      const saldos = [makeSaldo({ saldoQuantidade: 100 })];

      inventarioRepository.create.mockImplementation(async (inv) => inv);
      inventarioRepository.createItem.mockImplementation(async (item) => item);
      saldoRepository.findByDepositoId.mockResolvedValue(saldos);

      await useCase.execute(dto);

      const createdItem = inventarioRepository.createItem.mock.calls[0][0];
      expect(createdItem.saldoFisico).toBe(0);
    });

    it('deve criar itens com inventarioId referenciando o inventário criado', async () => {
      const dto = makeDto();
      const saldos = [makeSaldo()];

      inventarioRepository.create.mockImplementation(async (inv) => inv);
      inventarioRepository.createItem.mockImplementation(async (item) => item);
      saldoRepository.findByDepositoId.mockResolvedValue(saldos);

      const result = await useCase.execute(dto);

      const createdItem = inventarioRepository.createItem.mock.calls[0][0];
      expect(createdItem.inventarioId).toBe(result.id);
    });

    it('não deve criar itens quando não há saldos no depósito', async () => {
      const dto = makeDto();

      inventarioRepository.create.mockImplementation(async (inv) => inv);
      saldoRepository.findByDepositoId.mockResolvedValue([]);

      await useCase.execute(dto);

      expect(inventarioRepository.createItem).not.toHaveBeenCalled();
    });

    it('deve gerar id único para cada item criado', async () => {
      const dto = makeDto();
      const saldos = [
        makeSaldo({ id: 'saldo-001', produtoId: 'produto-001' }),
        makeSaldo({ id: 'saldo-002', produtoId: 'produto-002' }),
      ];

      inventarioRepository.create.mockImplementation(async (inv) => inv);
      inventarioRepository.createItem.mockImplementation(async (item) => item);
      saldoRepository.findByDepositoId.mockResolvedValue(saldos);

      await useCase.execute(dto);

      const item1 = inventarioRepository.createItem.mock.calls[0][0];
      const item2 = inventarioRepository.createItem.mock.calls[1][0];
      expect(item1.id).toBeDefined();
      expect(item2.id).toBeDefined();
      expect(item1.id).not.toBe(item2.id);
    });
  });
});
