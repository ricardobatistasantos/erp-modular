import { HttpException, HttpStatus } from '@nestjs/common';

import { ReceberTransferenciaUseCase } from '../../src/application/use-cases/receber-transferencia.use-case';
import { CreateMovimentoEstoqueUseCase } from '../../src/application/use-cases/create-movimento-estoque.use-case';
import { ITransferenciaEstoqueRepository } from '../../src/domain/repository/transferencia-estoque.repository';
import { TransferenciaEstoque } from '../../src/domain/entity/transferencia-estoque.entity';
import { TransferenciaItem } from '../../src/domain/entity/transferencia-item.entity';
import { MovimentoEstoque } from '../../src/domain/entity/movimento-estoque.entity';
import { StatusTransferenciaEstoque } from '../../src/domain/enums/status-transferencia-estoque.enum';
import { EstoqueTipoMovimento } from '../../src/domain/enums/estoque-tipo-movimento.enum';
import { EstoqueOrigem } from '../../src/domain/enums/estoque-origem.enum';
import { ReceberTransferenciaDto } from '../../src/application/dto/receber-transferencia.dto';

describe('ReceberTransferenciaUseCase', () => {
  let useCase: ReceberTransferenciaUseCase;
  let transferenciaRepository: jest.Mocked<ITransferenciaEstoqueRepository>;
  let createMovimentoEstoqueUseCase: jest.Mocked<CreateMovimentoEstoqueUseCase>;
  let mockConnection: jest.Mock;
  let mockTx: jest.Mock;
  let mockTransaction: Record<string, unknown>;

  beforeEach(() => {
    mockTransaction = {};
    mockTx = jest.fn((callback) => callback(mockTransaction));
    mockConnection = jest.fn(() => ({ tx: mockTx }));

    transferenciaRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      updateStatus: jest.fn(),
      createItem: jest.fn(),
      findItensByTransferenciaId: jest.fn(),
    };

    createMovimentoEstoqueUseCase = {
      execute: jest.fn(),
    } as any;

    useCase = new ReceberTransferenciaUseCase(
      transferenciaRepository,
      createMovimentoEstoqueUseCase,
      mockConnection,
    );
  });

  const makeTransferencia = (overrides?: Partial<TransferenciaEstoque>): TransferenciaEstoque =>
    new TransferenciaEstoque({
      id: 'transferencia-001',
      depositoOrigemId: 'deposito-origem-001',
      depositoDestinoId: 'deposito-destino-002',
      status: StatusTransferenciaEstoque.EM_TRANSITO,
      observacao: 'Transferência de reposição',
      createdAt: new Date(),
      ...overrides,
    });

  const makeItens = (): TransferenciaItem[] => [
    new TransferenciaItem({
      id: 'item-001',
      transferenciaId: 'transferencia-001',
      produtoId: 'produto-001',
      quantidade: 10,
    }),
    new TransferenciaItem({
      id: 'item-002',
      transferenciaId: 'transferencia-001',
      produtoId: 'produto-002',
      quantidade: 5,
    }),
  ];

  const makeDto = (overrides?: Partial<ReceberTransferenciaDto>): ReceberTransferenciaDto => ({
    transferenciaId: 'transferencia-001',
    ...overrides,
  });

  describe('Validações pré-transação', () => {
    it('deve lançar erro quando a transferência não é encontrada, SEM abrir transação', async () => {
      transferenciaRepository.findById.mockResolvedValue(null);

      const dto = makeDto();

      await expect(useCase.execute(dto)).rejects.toThrow(
        new HttpException('Transferência não encontrada', HttpStatus.NOT_FOUND),
      );

      expect(mockTx).not.toHaveBeenCalled();
    });

    it('deve lançar erro quando a transferência tem status CRIADA, SEM abrir transação', async () => {
      const transferencia = makeTransferencia({ status: StatusTransferenciaEstoque.CRIADA });
      transferenciaRepository.findById.mockResolvedValue(transferencia);

      const dto = makeDto();

      await expect(useCase.execute(dto)).rejects.toThrow(
        new HttpException(
          'Transferência não está em trânsito ou separada para ser recebida',
          HttpStatus.BAD_REQUEST,
        ),
      );

      expect(mockTx).not.toHaveBeenCalled();
    });

    it('deve lançar erro quando a transferência já foi recebida, SEM abrir transação', async () => {
      const transferencia = makeTransferencia({ status: StatusTransferenciaEstoque.RECEBIDA });
      transferenciaRepository.findById.mockResolvedValue(transferencia);

      const dto = makeDto();

      await expect(useCase.execute(dto)).rejects.toThrow(
        new HttpException(
          'Transferência não está em trânsito ou separada para ser recebida',
          HttpStatus.BAD_REQUEST,
        ),
      );

      expect(mockTx).not.toHaveBeenCalled();
    });

    it('deve aceitar transferência com status EM_TRANSITO', async () => {
      const transferencia = makeTransferencia({ status: StatusTransferenciaEstoque.EM_TRANSITO });
      const itens = makeItens();

      transferenciaRepository.findById.mockResolvedValue(transferencia);
      transferenciaRepository.findItensByTransferenciaId.mockResolvedValue(itens);
      createMovimentoEstoqueUseCase.execute.mockResolvedValue(new MovimentoEstoque());
      transferenciaRepository.updateStatus.mockResolvedValue(
        makeTransferencia({ status: StatusTransferenciaEstoque.RECEBIDA }),
      );

      const dto = makeDto();

      await expect(useCase.execute(dto)).resolves.not.toThrow();
    });

    it('deve aceitar transferência com status SEPARADA', async () => {
      const transferencia = makeTransferencia({ status: StatusTransferenciaEstoque.SEPARADA });
      const itens = makeItens();

      transferenciaRepository.findById.mockResolvedValue(transferencia);
      transferenciaRepository.findItensByTransferenciaId.mockResolvedValue(itens);
      createMovimentoEstoqueUseCase.execute.mockResolvedValue(new MovimentoEstoque());
      transferenciaRepository.updateStatus.mockResolvedValue(
        makeTransferencia({ status: StatusTransferenciaEstoque.RECEBIDA }),
      );

      const dto = makeDto();

      await expect(useCase.execute(dto)).resolves.not.toThrow();
    });
  });

  describe('Orquestração transacional', () => {
    it('deve envolver operações de persistência em connection().tx()', async () => {
      const transferencia = makeTransferencia();
      const itens = makeItens();

      transferenciaRepository.findById.mockResolvedValue(transferencia);
      transferenciaRepository.findItensByTransferenciaId.mockResolvedValue(itens);
      createMovimentoEstoqueUseCase.execute.mockResolvedValue(new MovimentoEstoque());
      transferenciaRepository.updateStatus.mockResolvedValue(
        makeTransferencia({ status: StatusTransferenciaEstoque.RECEBIDA }),
      );

      const dto = makeDto();
      await useCase.execute(dto);

      expect(mockConnection).toHaveBeenCalled();
      expect(mockTx).toHaveBeenCalledWith(expect.any(Function));
    });

    it('deve passar a transação t para createMovimentoEstoqueUseCase.execute', async () => {
      const transferencia = makeTransferencia();
      const itens = makeItens();

      transferenciaRepository.findById.mockResolvedValue(transferencia);
      transferenciaRepository.findItensByTransferenciaId.mockResolvedValue(itens);
      createMovimentoEstoqueUseCase.execute.mockResolvedValue(new MovimentoEstoque());
      transferenciaRepository.updateStatus.mockResolvedValue(
        makeTransferencia({ status: StatusTransferenciaEstoque.RECEBIDA }),
      );

      const dto = makeDto();
      await useCase.execute(dto);

      // Todas as chamadas devem receber mockTransaction como segundo argumento
      for (const call of createMovimentoEstoqueUseCase.execute.mock.calls) {
        expect(call[1]).toBe(mockTransaction);
      }
    });

    it('deve passar a transação t para transferenciaRepository.updateStatus', async () => {
      const transferencia = makeTransferencia();
      const itens = makeItens();

      transferenciaRepository.findById.mockResolvedValue(transferencia);
      transferenciaRepository.findItensByTransferenciaId.mockResolvedValue(itens);
      createMovimentoEstoqueUseCase.execute.mockResolvedValue(new MovimentoEstoque());
      transferenciaRepository.updateStatus.mockResolvedValue(
        makeTransferencia({ status: StatusTransferenciaEstoque.RECEBIDA }),
      );

      const dto = makeDto();
      await useCase.execute(dto);

      expect(transferenciaRepository.updateStatus).toHaveBeenCalledWith(
        'transferencia-001',
        StatusTransferenciaEstoque.RECEBIDA,
        mockTransaction,
      );
    });
  });

  describe('Criação de movimentos de estoque', () => {
    it('deve criar movimento de SAIDA no depósito de origem para cada item', async () => {
      const transferencia = makeTransferencia();
      const itens = makeItens();

      transferenciaRepository.findById.mockResolvedValue(transferencia);
      transferenciaRepository.findItensByTransferenciaId.mockResolvedValue(itens);
      createMovimentoEstoqueUseCase.execute.mockResolvedValue(new MovimentoEstoque());
      transferenciaRepository.updateStatus.mockResolvedValue(
        makeTransferencia({ status: StatusTransferenciaEstoque.RECEBIDA }),
      );

      const dto = makeDto();
      await useCase.execute(dto);

      // Para cada item: 1 saída + 1 entrada = 2 chamadas por item
      expect(createMovimentoEstoqueUseCase.execute).toHaveBeenCalledTimes(4);

      // Verificar chamada de saída para o primeiro item
      expect(createMovimentoEstoqueUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          produtoId: 'produto-001',
          depositoId: 'deposito-origem-001',
          tipo: EstoqueTipoMovimento.TRANSFERENCIA_SAIDA,
          origem: EstoqueOrigem.TRANSFERENCIA,
          origemId: 'transferencia-001',
          quantidade: 10,
          custoUnitario: 0,
        }),
        mockTransaction,
      );

      // Verificar chamada de saída para o segundo item
      expect(createMovimentoEstoqueUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          produtoId: 'produto-002',
          depositoId: 'deposito-origem-001',
          tipo: EstoqueTipoMovimento.TRANSFERENCIA_SAIDA,
          origem: EstoqueOrigem.TRANSFERENCIA,
          origemId: 'transferencia-001',
          quantidade: 5,
          custoUnitario: 0,
        }),
        mockTransaction,
      );
    });

    it('deve criar movimento de ENTRADA no depósito de destino para cada item', async () => {
      const transferencia = makeTransferencia();
      const itens = makeItens();

      transferenciaRepository.findById.mockResolvedValue(transferencia);
      transferenciaRepository.findItensByTransferenciaId.mockResolvedValue(itens);
      createMovimentoEstoqueUseCase.execute.mockResolvedValue(new MovimentoEstoque());
      transferenciaRepository.updateStatus.mockResolvedValue(
        makeTransferencia({ status: StatusTransferenciaEstoque.RECEBIDA }),
      );

      const dto = makeDto();
      await useCase.execute(dto);

      // Verificar chamada de entrada para o primeiro item
      expect(createMovimentoEstoqueUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          produtoId: 'produto-001',
          depositoId: 'deposito-destino-002',
          tipo: EstoqueTipoMovimento.TRANSFERENCIA_ENTRADA,
          origem: EstoqueOrigem.TRANSFERENCIA,
          origemId: 'transferencia-001',
          quantidade: 10,
          custoUnitario: 0,
        }),
        mockTransaction,
      );

      // Verificar chamada de entrada para o segundo item
      expect(createMovimentoEstoqueUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          produtoId: 'produto-002',
          depositoId: 'deposito-destino-002',
          tipo: EstoqueTipoMovimento.TRANSFERENCIA_ENTRADA,
          origem: EstoqueOrigem.TRANSFERENCIA,
          origemId: 'transferencia-001',
          quantidade: 5,
          custoUnitario: 0,
        }),
        mockTransaction,
      );
    });

    it('deve processar itens na ordem correta (saída antes de entrada para cada item)', async () => {
      const transferencia = makeTransferencia();
      const itens = [
        new TransferenciaItem({
          id: 'item-001',
          transferenciaId: 'transferencia-001',
          produtoId: 'produto-001',
          quantidade: 10,
        }),
      ];

      transferenciaRepository.findById.mockResolvedValue(transferencia);
      transferenciaRepository.findItensByTransferenciaId.mockResolvedValue(itens);
      createMovimentoEstoqueUseCase.execute.mockResolvedValue(new MovimentoEstoque());
      transferenciaRepository.updateStatus.mockResolvedValue(
        makeTransferencia({ status: StatusTransferenciaEstoque.RECEBIDA }),
      );

      const dto = makeDto();
      await useCase.execute(dto);

      const calls = createMovimentoEstoqueUseCase.execute.mock.calls;

      // Primeira chamada: saída
      expect(calls[0][0]).toEqual(
        expect.objectContaining({
          tipo: EstoqueTipoMovimento.TRANSFERENCIA_SAIDA,
          depositoId: 'deposito-origem-001',
        }),
      );

      // Segunda chamada: entrada
      expect(calls[1][0]).toEqual(
        expect.objectContaining({
          tipo: EstoqueTipoMovimento.TRANSFERENCIA_ENTRADA,
          depositoId: 'deposito-destino-002',
        }),
      );
    });
  });

  describe('Atualização de status', () => {
    it('deve atualizar o status da transferência para RECEBIDA dentro da transação', async () => {
      const transferencia = makeTransferencia();
      const itens = makeItens();

      transferenciaRepository.findById.mockResolvedValue(transferencia);
      transferenciaRepository.findItensByTransferenciaId.mockResolvedValue(itens);
      createMovimentoEstoqueUseCase.execute.mockResolvedValue(new MovimentoEstoque());
      transferenciaRepository.updateStatus.mockResolvedValue(
        makeTransferencia({ status: StatusTransferenciaEstoque.RECEBIDA }),
      );

      const dto = makeDto();
      await useCase.execute(dto);

      expect(transferenciaRepository.updateStatus).toHaveBeenCalledWith(
        'transferencia-001',
        StatusTransferenciaEstoque.RECEBIDA,
        mockTransaction,
      );
    });

    it('deve retornar a transferência atualizada', async () => {
      const transferencia = makeTransferencia();
      const itens = makeItens();
      const updatedTransferencia = makeTransferencia({ status: StatusTransferenciaEstoque.RECEBIDA });

      transferenciaRepository.findById.mockResolvedValue(transferencia);
      transferenciaRepository.findItensByTransferenciaId.mockResolvedValue(itens);
      createMovimentoEstoqueUseCase.execute.mockResolvedValue(new MovimentoEstoque());
      transferenciaRepository.updateStatus.mockResolvedValue(updatedTransferencia);

      const dto = makeDto();
      const result = await useCase.execute(dto);

      expect(result).toBe(updatedTransferencia);
      expect(result.status).toBe(StatusTransferenciaEstoque.RECEBIDA);
    });
  });
});
