import { CreateMovimentoEstoqueUseCase } from '../../src/application/use-cases/create-movimento-estoque.use-case';
import { IMovimentoEstoqueRepository } from '../../src/domain/repository/movimento-estoque.repository';
import { ISaldoEstoqueRepository } from '../../src/domain/repository/saldo-estoque.repository';
import { ICamadaCustoRepository } from '../../src/domain/repository/camada-custo.repository';
import { MovimentoEstoque } from '../../src/domain/entity/movimento-estoque.entity';
import { SaldoEstoque } from '../../src/domain/entity/saldo-estoque.entity';
import { CamadaCusto } from '../../src/domain/entity/camada-custo.entity';
import { EstoqueTipoMovimento } from '../../src/domain/enums/estoque-tipo-movimento.enum';
import { EstoqueOrigem } from '../../src/domain/enums/estoque-origem.enum';
import { CreateMovimentoEstoqueDto } from '../../src/application/dto/create-movimento-estoque.dto';

describe('CreateMovimentoEstoqueUseCase', () => {
  let useCase: CreateMovimentoEstoqueUseCase;
  let movimentoRepository: jest.Mocked<IMovimentoEstoqueRepository>;
  let saldoRepository: jest.Mocked<ISaldoEstoqueRepository>;
  let camadaCustoRepository: jest.Mocked<ICamadaCustoRepository>;
  let mockTransaction: any;
  let mockTx: jest.Mock;
  let mockConnection: jest.Mock;

  beforeEach(() => {
    movimentoRepository = {
      create: jest.fn(),
      findByProdutoId: jest.fn(),
      findByOrigem: jest.fn(),
    };

    saldoRepository = {
      upsert: jest.fn(),
      findByProdutoId: jest.fn(),
      findByDepositoId: jest.fn(),
      findByProdutoAndDeposito: jest.fn(),
    };

    camadaCustoRepository = {
      create: jest.fn(),
      findByProdutoId: jest.fn(),
    };

    mockTransaction = {};
    mockTx = jest.fn((callback) => callback(mockTransaction));
    mockConnection = jest.fn(() => ({ tx: mockTx }));

    useCase = new CreateMovimentoEstoqueUseCase(
      movimentoRepository,
      saldoRepository,
      camadaCustoRepository,
      mockConnection,
    );
  });

  const makeEntradaDto = (overrides?: Partial<CreateMovimentoEstoqueDto>): CreateMovimentoEstoqueDto => ({
    produtoId: 'produto-001',
    depositoId: 'deposito-001',
    tipo: EstoqueTipoMovimento.ENTRADA_COMPRA,
    origem: EstoqueOrigem.COMPRA,
    quantidade: 10,
    custoUnitario: 25.0,
    ...overrides,
  });

  const makeSaidaDto = (overrides?: Partial<CreateMovimentoEstoqueDto>): CreateMovimentoEstoqueDto => ({
    produtoId: 'produto-001',
    depositoId: 'deposito-001',
    tipo: EstoqueTipoMovimento.SAIDA_VENDA,
    origem: EstoqueOrigem.VENDA,
    quantidade: 5,
    custoUnitario: 25.0,
    ...overrides,
  });

  describe('Criação do movimento', () => {
    it('deve criar um movimento de estoque com valorTotal calculado', async () => {
      const dto = makeEntradaDto({ quantidade: 10, custoUnitario: 25.0 });

      movimentoRepository.create.mockImplementation(async (m) => m);
      saldoRepository.findByProdutoAndDeposito.mockResolvedValue(null);
      saldoRepository.upsert.mockImplementation(async (s) => s);
      camadaCustoRepository.create.mockImplementation(async (c) => c);

      const result = await useCase.execute(dto);

      expect(result).toBeInstanceOf(MovimentoEstoque);
      expect(result.valorTotal).toBe(250.0);
      expect(result.produtoId).toBe('produto-001');
      expect(result.depositoId).toBe('deposito-001');
      expect(result.tipo).toBe(EstoqueTipoMovimento.ENTRADA_COMPRA);
      expect(result.origem).toBe(EstoqueOrigem.COMPRA);
      expect(result.quantidade).toBe(10);
      expect(result.custoUnitario).toBe(25.0);
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it('deve incluir campos opcionais quando fornecidos', async () => {
      const dto = makeEntradaDto({
        enderecoId: 'endereco-001',
        loteId: 'lote-001',
        origemId: 'compra-001',
        observacao: 'Entrada de compra NF 123',
        usuarioId: 'user-001',
      });

      movimentoRepository.create.mockImplementation(async (m) => m);
      saldoRepository.findByProdutoAndDeposito.mockResolvedValue(null);
      saldoRepository.upsert.mockImplementation(async (s) => s);
      camadaCustoRepository.create.mockImplementation(async (c) => c);

      const result = await useCase.execute(dto);

      expect(result.enderecoId).toBe('endereco-001');
      expect(result.loteId).toBe('lote-001');
      expect(result.origemId).toBe('compra-001');
      expect(result.observacao).toBe('Entrada de compra NF 123');
      expect(result.usuarioId).toBe('user-001');
    });

    it('deve chamar movimentoRepository.create com o movimento', async () => {
      const dto = makeEntradaDto();

      movimentoRepository.create.mockImplementation(async (m) => m);
      saldoRepository.findByProdutoAndDeposito.mockResolvedValue(null);
      saldoRepository.upsert.mockImplementation(async (s) => s);
      camadaCustoRepository.create.mockImplementation(async (c) => c);

      await useCase.execute(dto);

      expect(movimentoRepository.create).toHaveBeenCalledTimes(1);
      expect(movimentoRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          produtoId: 'produto-001',
          depositoId: 'deposito-001',
          tipo: EstoqueTipoMovimento.ENTRADA_COMPRA,
          valorTotal: 250.0,
        }),
        mockTransaction,
      );
    });
  });

  describe('Atualização de saldo - ENTRADA', () => {
    it('deve criar novo saldo quando não existe para produto/depósito', async () => {
      const dto = makeEntradaDto({ quantidade: 10, custoUnitario: 20.0 });

      movimentoRepository.create.mockImplementation(async (m) => m);
      saldoRepository.findByProdutoAndDeposito.mockResolvedValue(null);
      saldoRepository.upsert.mockImplementation(async (s) => s);
      camadaCustoRepository.create.mockImplementation(async (c) => c);

      await useCase.execute(dto);

      expect(saldoRepository.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          produtoId: 'produto-001',
          depositoId: 'deposito-001',
          saldoQuantidade: 10,
          custoMedio: 20.0,
        }),
        mockTransaction,
      );
    });

    it('deve somar quantidade ao saldo existente para ENTRADA', async () => {
      const dto = makeEntradaDto({ quantidade: 5, custoUnitario: 30.0 });
      const saldoExistente = new SaldoEstoque({
        id: 'saldo-001',
        produtoId: 'produto-001',
        depositoId: 'deposito-001',
        saldoQuantidade: 10,
        reservado: 0,
        custoMedio: 20.0,
        updatedAt: new Date(),
      });

      movimentoRepository.create.mockImplementation(async (m) => m);
      saldoRepository.findByProdutoAndDeposito.mockResolvedValue(saldoExistente);
      saldoRepository.upsert.mockImplementation(async (s) => s);
      camadaCustoRepository.create.mockImplementation(async (c) => c);

      await useCase.execute(dto);

      // Custo médio: (10*20 + 5*30) / 15 = 350/15 ≈ 23.33
      expect(saldoRepository.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          saldoQuantidade: 15,
          custoMedio: expect.closeTo(23.33, 1),
        }),
        mockTransaction,
      );
    });

    it('deve calcular custo médio ponderado corretamente', async () => {
      const dto = makeEntradaDto({ quantidade: 20, custoUnitario: 50.0 });
      const saldoExistente = new SaldoEstoque({
        id: 'saldo-001',
        produtoId: 'produto-001',
        depositoId: 'deposito-001',
        saldoQuantidade: 100,
        reservado: 0,
        custoMedio: 10.0,
        updatedAt: new Date(),
      });

      movimentoRepository.create.mockImplementation(async (m) => m);
      saldoRepository.findByProdutoAndDeposito.mockResolvedValue(saldoExistente);
      saldoRepository.upsert.mockImplementation(async (s) => s);
      camadaCustoRepository.create.mockImplementation(async (c) => c);

      await useCase.execute(dto);

      // Custo médio: (100*10 + 20*50) / 120 = 2000/120 ≈ 16.67
      expect(saldoRepository.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          saldoQuantidade: 120,
          custoMedio: expect.closeTo(16.67, 1),
        }),
        mockTransaction,
      );
    });

    it('deve tratar todos os tipos de ENTRADA corretamente', async () => {
      const tiposEntrada = [
        EstoqueTipoMovimento.ENTRADA_COMPRA,
        EstoqueTipoMovimento.ENTRADA_DEVOLUCAO,
        EstoqueTipoMovimento.AJUSTE_POSITIVO,
        EstoqueTipoMovimento.TRANSFERENCIA_ENTRADA,
        EstoqueTipoMovimento.PRODUCAO_ENTRADA,
      ];

      for (const tipo of tiposEntrada) {
        jest.clearAllMocks();
        const dto = makeEntradaDto({ tipo, quantidade: 5, custoUnitario: 10.0 });

        movimentoRepository.create.mockImplementation(async (m) => m);
        saldoRepository.findByProdutoAndDeposito.mockResolvedValue(null);
        saldoRepository.upsert.mockImplementation(async (s) => s);
        camadaCustoRepository.create.mockImplementation(async (c) => c);

        await useCase.execute(dto);

        expect(saldoRepository.upsert).toHaveBeenCalledWith(
          expect.objectContaining({
            saldoQuantidade: 5,
          }),
          mockTransaction,
        );
      }
    });
  });

  describe('Atualização de saldo - SAIDA', () => {
    it('deve subtrair quantidade do saldo para SAIDA', async () => {
      const dto = makeSaidaDto({ quantidade: 3 });
      const saldoExistente = new SaldoEstoque({
        id: 'saldo-001',
        produtoId: 'produto-001',
        depositoId: 'deposito-001',
        saldoQuantidade: 10,
        reservado: 0,
        custoMedio: 20.0,
        updatedAt: new Date(),
      });

      movimentoRepository.create.mockImplementation(async (m) => m);
      saldoRepository.findByProdutoAndDeposito.mockResolvedValue(saldoExistente);
      saldoRepository.upsert.mockImplementation(async (s) => s);

      await useCase.execute(dto);

      expect(saldoRepository.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          saldoQuantidade: 7,
        }),
        mockTransaction,
      );
    });

    it('deve tratar tipos de SAIDA corretamente', async () => {
      const tiposSaida = [
        EstoqueTipoMovimento.SAIDA_VENDA,
        EstoqueTipoMovimento.SAIDA_DEVOLUCAO,
        EstoqueTipoMovimento.AJUSTE_NEGATIVO,
        EstoqueTipoMovimento.TRANSFERENCIA_SAIDA,
        EstoqueTipoMovimento.PRODUCAO_CONSUMO,
        EstoqueTipoMovimento.CONSUMO_INTERNO,
        EstoqueTipoMovimento.PERDA,
        EstoqueTipoMovimento.AVARIA,
        EstoqueTipoMovimento.INVENTARIO,
      ];

      for (const tipo of tiposSaida) {
        jest.clearAllMocks();
        const dto = makeSaidaDto({ tipo, quantidade: 2 });
        const saldoExistente = new SaldoEstoque({
          id: 'saldo-001',
          produtoId: 'produto-001',
          depositoId: 'deposito-001',
          saldoQuantidade: 10,
          reservado: 0,
          custoMedio: 20.0,
          updatedAt: new Date(),
        });

        movimentoRepository.create.mockImplementation(async (m) => m);
        saldoRepository.findByProdutoAndDeposito.mockResolvedValue(saldoExistente);
        saldoRepository.upsert.mockImplementation(async (s) => s);

        await useCase.execute(dto);

        expect(saldoRepository.upsert).toHaveBeenCalledWith(
          expect.objectContaining({
            saldoQuantidade: 8,
          }),
          mockTransaction,
        );
      }
    });

    it('não deve criar camada de custo para SAIDA', async () => {
      const dto = makeSaidaDto();
      const saldoExistente = new SaldoEstoque({
        id: 'saldo-001',
        produtoId: 'produto-001',
        depositoId: 'deposito-001',
        saldoQuantidade: 10,
        reservado: 0,
        custoMedio: 20.0,
        updatedAt: new Date(),
      });

      movimentoRepository.create.mockImplementation(async (m) => m);
      saldoRepository.findByProdutoAndDeposito.mockResolvedValue(saldoExistente);
      saldoRepository.upsert.mockImplementation(async (s) => s);

      await useCase.execute(dto);

      expect(camadaCustoRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('Camada de custo', () => {
    it('deve criar camada de custo para movimentos de ENTRADA', async () => {
      const dto = makeEntradaDto({ quantidade: 10, custoUnitario: 25.0 });

      movimentoRepository.create.mockImplementation(async (m) => m);
      saldoRepository.findByProdutoAndDeposito.mockResolvedValue(null);
      saldoRepository.upsert.mockImplementation(async (s) => s);
      camadaCustoRepository.create.mockImplementation(async (c) => c);

      await useCase.execute(dto);

      expect(camadaCustoRepository.create).toHaveBeenCalledTimes(1);
      expect(camadaCustoRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          produtoId: 'produto-001',
          quantidade: 10,
          custoUnitario: 25.0,
          saldoQuantidade: 10,
        }),
        mockTransaction,
      );
    });

    it('deve vincular camada de custo ao movimento criado', async () => {
      const dto = makeEntradaDto();

      const movimentoCriado = new MovimentoEstoque({
        id: 'mov-123',
        produtoId: dto.produtoId,
        depositoId: dto.depositoId,
        tipo: EstoqueTipoMovimento.ENTRADA_COMPRA,
        origem: EstoqueOrigem.COMPRA,
        quantidade: dto.quantidade,
        custoUnitario: dto.custoUnitario,
        valorTotal: dto.quantidade * dto.custoUnitario,
        createdAt: new Date(),
      });

      movimentoRepository.create.mockResolvedValue(movimentoCriado);
      saldoRepository.findByProdutoAndDeposito.mockResolvedValue(null);
      saldoRepository.upsert.mockImplementation(async (s) => s);
      camadaCustoRepository.create.mockImplementation(async (c) => c);

      await useCase.execute(dto);

      expect(camadaCustoRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          movimentoId: 'mov-123',
        }),
        mockTransaction,
      );
    });
  });
});
