import { CreateTransferenciaUseCase } from '../../src/application/use-cases/create-transferencia.use-case';
import { ITransferenciaEstoqueRepository } from '../../src/domain/repository/transferencia-estoque.repository';
import { TransferenciaEstoque } from '../../src/domain/entity/transferencia-estoque.entity';
import { TransferenciaItem } from '../../src/domain/entity/transferencia-item.entity';
import { StatusTransferenciaEstoque } from '../../src/domain/enums/status-transferencia-estoque.enum';
import { CreateTransferenciaDto } from '../../src/application/dto/create-transferencia.dto';

describe('CreateTransferenciaUseCase', () => {
  let useCase: CreateTransferenciaUseCase;
  let transferenciaRepository: jest.Mocked<ITransferenciaEstoqueRepository>;

  beforeEach(() => {
    transferenciaRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      updateStatus: jest.fn(),
      createItem: jest.fn(),
      findItensByTransferenciaId: jest.fn(),
    };

    useCase = new CreateTransferenciaUseCase(transferenciaRepository);
  });

  const makeDto = (overrides?: Partial<CreateTransferenciaDto>): CreateTransferenciaDto => ({
    depositoOrigemId: 'deposito-origem-001',
    depositoDestinoId: 'deposito-destino-002',
    observacao: 'Transferência de reposição',
    itens: [
      { produtoId: 'produto-001', quantidade: 10 },
      { produtoId: 'produto-002', quantidade: 5 },
    ],
    ...overrides,
  });

  describe('Criação da transferência', () => {
    it('deve criar uma transferência com status CRIADA', async () => {
      const dto = makeDto();

      transferenciaRepository.create.mockImplementation(async (t) => t);

      const result = await useCase.execute(dto);

      expect(result).toBeInstanceOf(TransferenciaEstoque);
      expect(result.depositoOrigemId).toBe('deposito-origem-001');
      expect(result.depositoDestinoId).toBe('deposito-destino-002');
      expect(result.status).toBe(StatusTransferenciaEstoque.CRIADA);
      expect(result.observacao).toBe('Transferência de reposição');
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it('deve criar transferência sem observação quando não informada', async () => {
      const dto = makeDto({ observacao: undefined });

      transferenciaRepository.create.mockImplementation(async (t) => t);

      const result = await useCase.execute(dto);

      expect(result.observacao).toBeUndefined();
    });

    it('deve gerar um id único para a transferência', async () => {
      const dto = makeDto();

      transferenciaRepository.create.mockImplementation(async (t) => t);

      const result1 = await useCase.execute(dto);
      const result2 = await useCase.execute(dto);

      expect(result1.id).not.toBe(result2.id);
    });
  });

  describe('Criação dos itens da transferência', () => {
    it('deve chamar repository.create com a transferência e os itens', async () => {
      const dto = makeDto();

      transferenciaRepository.create.mockImplementation(async (t) => t);

      await useCase.execute(dto);

      expect(transferenciaRepository.create).toHaveBeenCalledTimes(1);
      expect(transferenciaRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          depositoOrigemId: 'deposito-origem-001',
          depositoDestinoId: 'deposito-destino-002',
          status: StatusTransferenciaEstoque.CRIADA,
        }),
        expect.arrayContaining([
          expect.objectContaining({
            produtoId: 'produto-001',
            quantidade: 10,
          }),
          expect.objectContaining({
            produtoId: 'produto-002',
            quantidade: 5,
          }),
        ]),
      );
    });

    it('deve criar itens com transferenciaId igual ao id da transferência', async () => {
      const dto = makeDto();

      transferenciaRepository.create.mockImplementation(async (t) => t);

      await useCase.execute(dto);

      const [transferencia, itens] = transferenciaRepository.create.mock.calls[0];

      for (const item of itens) {
        expect(item.transferenciaId).toBe(transferencia.id);
      }
    });

    it('deve criar um TransferenciaItem para cada item do DTO', async () => {
      const dto = makeDto({
        itens: [
          { produtoId: 'produto-001', quantidade: 10 },
          { produtoId: 'produto-002', quantidade: 5 },
          { produtoId: 'produto-003', quantidade: 3 },
        ],
      });

      transferenciaRepository.create.mockImplementation(async (t) => t);

      await useCase.execute(dto);

      const [, itens] = transferenciaRepository.create.mock.calls[0];

      expect(itens).toHaveLength(3);
      expect(itens[0]).toBeInstanceOf(TransferenciaItem);
      expect(itens[1]).toBeInstanceOf(TransferenciaItem);
      expect(itens[2]).toBeInstanceOf(TransferenciaItem);
    });

    it('deve gerar ids únicos para cada item', async () => {
      const dto = makeDto({
        itens: [
          { produtoId: 'produto-001', quantidade: 10 },
          { produtoId: 'produto-002', quantidade: 5 },
        ],
      });

      transferenciaRepository.create.mockImplementation(async (t) => t);

      await useCase.execute(dto);

      const [, itens] = transferenciaRepository.create.mock.calls[0];

      expect(itens[0].id).toBeDefined();
      expect(itens[1].id).toBeDefined();
      expect(itens[0].id).not.toBe(itens[1].id);
    });
  });
});
