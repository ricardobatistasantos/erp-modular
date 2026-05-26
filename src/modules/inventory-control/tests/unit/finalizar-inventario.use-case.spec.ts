import { HttpException, HttpStatus } from '@nestjs/common';

import { FinalizarInventarioUseCase } from '../../src/application/use-cases/finalizar-inventario.use-case';
import { CreateMovimentoEstoqueUseCase } from '../../src/application/use-cases/create-movimento-estoque.use-case';
import { IInventarioRepository } from '../../src/domain/repository/inventario.repository';
import { Inventario } from '../../src/domain/entity/inventario.entity';
import { InventarioItem } from '../../src/domain/entity/inventario-item.entity';
import { FinalizarInventarioDto } from '../../src/application/dto/finalizar-inventario.dto';
import { EstoqueTipoMovimento } from '../../src/domain/enums/estoque-tipo-movimento.enum';
import { EstoqueOrigem } from '../../src/domain/enums/estoque-origem.enum';

describe('FinalizarInventarioUseCase', () => {
  let useCase: FinalizarInventarioUseCase;
  let inventarioRepository: jest.Mocked<IInventarioRepository>;
  let createMovimentoEstoqueUseCase: jest.Mocked<CreateMovimentoEstoqueUseCase>;

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

    createMovimentoEstoqueUseCase = {
      execute: jest.fn(),
    } as any;

    useCase = new FinalizarInventarioUseCase(
      inventarioRepository,
      createMovimentoEstoqueUseCase,
    );
  });

  const makeDto = (overrides?: Partial<FinalizarInventarioDto>): FinalizarInventarioDto => ({
    inventarioId: 'inventario-001',
    ...overrides,
  });

  const makeInventario = (overrides?: Partial<Inventario>): Inventario =>
    new Inventario({
      id: 'inventario-001',
      depositoId: 'deposito-001',
      status: 'ABERTO',
      iniciadoEm: new Date(),
      createdAt: new Date(),
      ...overrides,
    });

  const makeItem = (overrides?: Partial<InventarioItem>): InventarioItem =>
    new InventarioItem({
      id: 'item-001',
      inventarioId: 'inventario-001',
      produtoId: 'produto-001',
      saldoSistema: 50,
      saldoFisico: 50,
      ...overrides,
    });

  describe('Validações', () => {
    it('deve lançar erro se o inventário não for encontrado', async () => {
      const dto = makeDto();
      inventarioRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(dto)).rejects.toThrow(HttpException);
      await expect(useCase.execute(dto)).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('deve lançar erro se o inventário não estiver com status ABERTO', async () => {
      const dto = makeDto();
      const inventario = makeInventario({ status: 'FINALIZADO' });
      inventarioRepository.findById.mockResolvedValue(inventario);

      await expect(useCase.execute(dto)).rejects.toThrow(HttpException);
      await expect(useCase.execute(dto)).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('deve buscar o inventário pelo ID informado no DTO', async () => {
      const dto = makeDto({ inventarioId: 'inv-xyz' });
      inventarioRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(dto)).rejects.toThrow();

      expect(inventarioRepository.findById).toHaveBeenCalledWith('inv-xyz');
    });
  });

  describe('Geração de ajustes de estoque', () => {
    it('deve buscar itens do inventário via findItensByInventarioId', async () => {
      const dto = makeDto();
      const inventario = makeInventario();
      inventarioRepository.findById.mockResolvedValue(inventario);
      inventarioRepository.findItensByInventarioId.mockResolvedValue([]);
      inventarioRepository.finalize.mockResolvedValue(
        makeInventario({ status: 'FINALIZADO' }),
      );

      await useCase.execute(dto);

      expect(inventarioRepository.findItensByInventarioId).toHaveBeenCalledWith('inventario-001');
    });

    it('deve criar AJUSTE_POSITIVO quando saldoFisico > saldoSistema', async () => {
      const dto = makeDto();
      const inventario = makeInventario();
      const item = makeItem({ produtoId: 'produto-001', saldoSistema: 50, saldoFisico: 60 });

      inventarioRepository.findById.mockResolvedValue(inventario);
      inventarioRepository.findItensByInventarioId.mockResolvedValue([item]);
      inventarioRepository.finalize.mockResolvedValue(
        makeInventario({ status: 'FINALIZADO' }),
      );
      createMovimentoEstoqueUseCase.execute.mockResolvedValue({} as any);

      await useCase.execute(dto);

      expect(createMovimentoEstoqueUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          produtoId: 'produto-001',
          depositoId: 'deposito-001',
          tipo: EstoqueTipoMovimento.AJUSTE_POSITIVO,
          origem: EstoqueOrigem.INVENTARIO,
          origemId: 'inventario-001',
          quantidade: 10,
          custoUnitario: 0,
        }),
      );
    });

    it('deve criar AJUSTE_NEGATIVO quando saldoFisico < saldoSistema', async () => {
      const dto = makeDto();
      const inventario = makeInventario();
      const item = makeItem({ produtoId: 'produto-002', saldoSistema: 100, saldoFisico: 80 });

      inventarioRepository.findById.mockResolvedValue(inventario);
      inventarioRepository.findItensByInventarioId.mockResolvedValue([item]);
      inventarioRepository.finalize.mockResolvedValue(
        makeInventario({ status: 'FINALIZADO' }),
      );
      createMovimentoEstoqueUseCase.execute.mockResolvedValue({} as any);

      await useCase.execute(dto);

      expect(createMovimentoEstoqueUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          produtoId: 'produto-002',
          depositoId: 'deposito-001',
          tipo: EstoqueTipoMovimento.AJUSTE_NEGATIVO,
          origem: EstoqueOrigem.INVENTARIO,
          origemId: 'inventario-001',
          quantidade: 20,
          custoUnitario: 0,
        }),
      );
    });

    it('não deve criar movimento para itens sem divergência', async () => {
      const dto = makeDto();
      const inventario = makeInventario();
      const item = makeItem({ saldoSistema: 50, saldoFisico: 50 });

      inventarioRepository.findById.mockResolvedValue(inventario);
      inventarioRepository.findItensByInventarioId.mockResolvedValue([item]);
      inventarioRepository.finalize.mockResolvedValue(
        makeInventario({ status: 'FINALIZADO' }),
      );

      await useCase.execute(dto);

      expect(createMovimentoEstoqueUseCase.execute).not.toHaveBeenCalled();
    });

    it('deve criar movimentos para múltiplos itens com divergência', async () => {
      const dto = makeDto();
      const inventario = makeInventario();
      const itens = [
        makeItem({ id: 'item-1', produtoId: 'prod-1', saldoSistema: 10, saldoFisico: 15 }),
        makeItem({ id: 'item-2', produtoId: 'prod-2', saldoSistema: 20, saldoFisico: 20 }),
        makeItem({ id: 'item-3', produtoId: 'prod-3', saldoSistema: 30, saldoFisico: 25 }),
      ];

      inventarioRepository.findById.mockResolvedValue(inventario);
      inventarioRepository.findItensByInventarioId.mockResolvedValue(itens);
      inventarioRepository.finalize.mockResolvedValue(
        makeInventario({ status: 'FINALIZADO' }),
      );
      createMovimentoEstoqueUseCase.execute.mockResolvedValue({} as any);

      await useCase.execute(dto);

      // Apenas 2 itens têm divergência (item-1 e item-3)
      expect(createMovimentoEstoqueUseCase.execute).toHaveBeenCalledTimes(2);
    });

    it('não deve criar movimentos quando não há itens no inventário', async () => {
      const dto = makeDto();
      const inventario = makeInventario();

      inventarioRepository.findById.mockResolvedValue(inventario);
      inventarioRepository.findItensByInventarioId.mockResolvedValue([]);
      inventarioRepository.finalize.mockResolvedValue(
        makeInventario({ status: 'FINALIZADO' }),
      );

      await useCase.execute(dto);

      expect(createMovimentoEstoqueUseCase.execute).not.toHaveBeenCalled();
    });
  });

  describe('Finalização do inventário', () => {
    it('deve chamar inventarioRepository.finalize com o ID do inventário', async () => {
      const dto = makeDto();
      const inventario = makeInventario();

      inventarioRepository.findById.mockResolvedValue(inventario);
      inventarioRepository.findItensByInventarioId.mockResolvedValue([]);
      inventarioRepository.finalize.mockResolvedValue(
        makeInventario({ status: 'FINALIZADO' }),
      );

      await useCase.execute(dto);

      expect(inventarioRepository.finalize).toHaveBeenCalledWith('inventario-001');
    });

    it('deve retornar o inventário finalizado', async () => {
      const dto = makeDto();
      const inventario = makeInventario();
      const finalizado = makeInventario({ status: 'FINALIZADO', finalizadoEm: new Date() });

      inventarioRepository.findById.mockResolvedValue(inventario);
      inventarioRepository.findItensByInventarioId.mockResolvedValue([]);
      inventarioRepository.finalize.mockResolvedValue(finalizado);

      const result = await useCase.execute(dto);

      expect(result).toBe(finalizado);
      expect(result.status).toBe('FINALIZADO');
    });

    it('deve finalizar após gerar todos os ajustes', async () => {
      const dto = makeDto();
      const inventario = makeInventario();
      const item = makeItem({ saldoSistema: 10, saldoFisico: 20 });

      inventarioRepository.findById.mockResolvedValue(inventario);
      inventarioRepository.findItensByInventarioId.mockResolvedValue([item]);
      inventarioRepository.finalize.mockResolvedValue(
        makeInventario({ status: 'FINALIZADO' }),
      );
      createMovimentoEstoqueUseCase.execute.mockResolvedValue({} as any);

      await useCase.execute(dto);

      // Verifica que finalize foi chamado após o movimento
      const movimentoCallOrder = createMovimentoEstoqueUseCase.execute.mock.invocationCallOrder[0];
      const finalizeCallOrder = inventarioRepository.finalize.mock.invocationCallOrder[0];
      expect(movimentoCallOrder).toBeLessThan(finalizeCallOrder);
    });
  });
});
