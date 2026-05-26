import { GetSaldoByProdutoUseCase } from '../../src/application/use-cases/get-saldo-by-produto.use-case';
import { ISaldoEstoqueRepository } from '../../src/domain/repository/saldo-estoque.repository';
import { SaldoEstoque } from '../../src/domain/entity/saldo-estoque.entity';

describe('GetSaldoByProdutoUseCase', () => {
  let useCase: GetSaldoByProdutoUseCase;
  let saldoRepository: jest.Mocked<ISaldoEstoqueRepository>;

  beforeEach(() => {
    saldoRepository = {
      upsert: jest.fn(),
      findByProdutoId: jest.fn(),
      findByDepositoId: jest.fn(),
      findByProdutoAndDeposito: jest.fn(),
    };

    useCase = new GetSaldoByProdutoUseCase(saldoRepository);
  });

  it('deve chamar findByProdutoId com o produtoId informado', async () => {
    saldoRepository.findByProdutoId.mockResolvedValue([]);

    await useCase.execute('produto-001');

    expect(saldoRepository.findByProdutoId).toHaveBeenCalledTimes(1);
    expect(saldoRepository.findByProdutoId).toHaveBeenCalledWith('produto-001');
  });

  it('deve retornar lista de SaldoEstoque para o produto', async () => {
    const saldos = [
      new SaldoEstoque({
        id: 'saldo-001',
        produtoId: 'produto-001',
        depositoId: 'deposito-001',
        saldoQuantidade: 50,
        reservado: 10,
        custoMedio: 15.0,
        updatedAt: new Date(),
      }),
      new SaldoEstoque({
        id: 'saldo-002',
        produtoId: 'produto-001',
        depositoId: 'deposito-002',
        saldoQuantidade: 30,
        reservado: 5,
        custoMedio: 18.0,
        updatedAt: new Date(),
      }),
    ];

    saldoRepository.findByProdutoId.mockResolvedValue(saldos);

    const result = await useCase.execute('produto-001');

    expect(result).toHaveLength(2);
    expect(result[0]).toBeInstanceOf(SaldoEstoque);
    expect(result[0].produtoId).toBe('produto-001');
    expect(result[0].depositoId).toBe('deposito-001');
    expect(result[0].saldoQuantidade).toBe(50);
    expect(result[1].depositoId).toBe('deposito-002');
    expect(result[1].saldoQuantidade).toBe(30);
  });

  it('deve retornar lista vazia quando não há saldo para o produto', async () => {
    saldoRepository.findByProdutoId.mockResolvedValue([]);

    const result = await useCase.execute('produto-inexistente');

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('deve retornar saldo com disponivel calculado corretamente', async () => {
    const saldos = [
      new SaldoEstoque({
        id: 'saldo-001',
        produtoId: 'produto-001',
        depositoId: 'deposito-001',
        saldoQuantidade: 100,
        reservado: 25,
        custoMedio: 10.0,
        updatedAt: new Date(),
      }),
    ];

    saldoRepository.findByProdutoId.mockResolvedValue(saldos);

    const result = await useCase.execute('produto-001');

    expect(result[0].disponivel).toBe(75);
  });
});
