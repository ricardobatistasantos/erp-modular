# Tasks — Inventory Control Module

## Task 1: Criar entidades de domínio base (Deposito, EnderecoEstoque, LoteProduto)

Create the foundational domain entities for the inventory control module following the project's existing patterns.

### Sub-tasks:
- [x] Criar entidade `Deposito` com campos: id, empresaId, nome, ativo, createdAt
- [x] Criar entidade `EnderecoEstoque` com campos: id, depositoId, codigo, descricao, createdAt
- [x] Criar entidade `LoteProduto` com campos: id, produtoId, lote, fabricacao, validade, createdAt
- [x] Criar enums `EstoqueTipoMovimento` e `EstoqueOrigem`

## Task 2: Criar entidades de movimentação e saldo
Depends on: Task 1

### Sub-tasks:
- [x] Criar entidade `MovimentoEstoque` com campos: id, produtoId, depositoId, enderecoId, loteId, tipo, origem, origemId, quantidade, custoUnitario, valorTotal, observacao, usuarioId, createdAt
- [x] Criar entidade `SaldoEstoque` com campos: id, produtoId, depositoId, enderecoId, loteId, saldoQuantidade, reservado, disponivel, custoMedio, updatedAt
- [x] Criar entidade `CamadaCusto` com campos: id, produtoId, movimentoId, quantidade, custoUnitario, saldoQuantidade, createdAt

## Task 3: Criar entidades de reserva e transferência
Depends on: Task 1

### Sub-tasks:
- [x] Criar entidade `ReservaEstoque` com campos: id, produtoId, depositoId, origem, origemId, quantidade, status, createdAt
- [x] Criar enum `StatusReservaEstoque` (RESERVADO, SEPARADO, FATURADO, CANCELADO)
- [x] Criar entidade `TransferenciaEstoque` com campos: id, depositoOrigemId, depositoDestinoId, status, observacao, createdAt
- [x] Criar entidade `TransferenciaItem` com campos: id, transferenciaId, produtoId, quantidade
- [x] Criar enum `StatusTransferenciaEstoque` (CRIADA, SEPARADA, EM_TRANSITO, RECEBIDA)

## Task 4: Criar entidades de inventário e requisição
Depends on: Task 1

### Sub-tasks:
- [x] Criar entidade `Inventario` com campos: id, depositoId, status, iniciadoEm, finalizadoEm, createdAt
- [x] Criar entidade `InventarioItem` com campos: id, inventarioId, produtoId, saldoSistema, saldoFisico, divergencia
- [x] Criar entidade `RequisicaoAlmoxarifado` com campos: id, solicitanteId, setorId, status, observacao, createdAt
- [x] Criar entidade `RequisicaoItem` com campos: id, requisicaoId, produtoId, quantidade, quantidadeAtendida
- [x] Criar entidade `CautelaFerramenta` com campos: id, funcionarioId, produtoId, quantidade, retiradoEm, devolvidoEm

## Task 5: Criar interfaces de repositório
Depends on: Task 2, Task 3, Task 4

### Sub-tasks:
- [x] Criar `IDepositoRepository` com métodos: create, findById, findAll, update
- [x] Criar `IMovimentoEstoqueRepository` com métodos: create, findByProdutoId, findByOrigem
- [x] Criar `ISaldoEstoqueRepository` com métodos: upsert, findByProdutoId, findByDepositoId
- [x] Criar `IReservaEstoqueRepository` com métodos: create, findByOrigem, updateStatus
- [x] Criar `ITransferenciaEstoqueRepository` com métodos: create, findById, updateStatus
- [x] Criar `IInventarioRepository` com métodos: create, findById, finalize
- [x] Criar `ICamadaCustoRepository` com métodos: create, findByProdutoId

## Task 6: Implementar use cases de movimentação
Depends on: Task 5

### Sub-tasks:
- [x] Implementar `CreateMovimentoEstoqueUseCase` — registra movimento e atualiza saldo via UPSERT
- [x] Implementar `GetSaldoByProdutoUseCase` — retorna saldo por produto/depósito
- [x] Criar DTOs: `CreateMovimentoEstoqueDto`, `GetSaldoByProdutoDto`

## Task 7: Implementar use cases de reserva e transferência
Depends on: Task 5

### Sub-tasks:
- [x] Implementar `CreateReservaEstoqueUseCase` — cria reserva e atualiza campo reservado no saldo
- [x] Implementar `CreateTransferenciaUseCase` — cria transferência com itens
- [x] Implementar `ReceberTransferenciaUseCase` — gera movimentos de saída/entrada e atualiza saldos
- [x] Criar DTOs: `CreateReservaDto`, `CreateTransferenciaDto`, `ReceberTransferenciaDto`

## Task 8: Implementar use cases de inventário
Depends on: Task 5

### Sub-tasks:
- [x] Implementar `CreateInventarioUseCase` — cria inventário e carrega saldos do sistema
- [x] Implementar `FinalizarInventarioUseCase` — gera ajustes de estoque para divergências
- [x] Criar DTOs: `CreateInventarioDto`, `FinalizarInventarioDto`, `RegistrarContagemDto`

## Task 9: Implementar repositórios com pg-promise
Depends on: Task 6, Task 7, Task 8

### Sub-tasks:
- [x] Implementar `DepositoRepository`
- [x] Implementar `MovimentoEstoqueRepository`
- [x] Implementar `SaldoEstoqueRepository` com UPSERT
- [x] Implementar `ReservaEstoqueRepository`
- [x] Implementar `TransferenciaEstoqueRepository`
- [x] Implementar `InventarioRepository`
- [x] Implementar `CamadaCustoRepository`

## Task 10: Implementar controller e registrar módulo
Depends on: Task 9

### Sub-tasks:
- [x] Implementar `InventoryControlController` com endpoints: POST /movement, GET /balance/:productId, POST /transfer, PUT /transfer/:id/receive, POST /inventory, PUT /inventory/:id/finalize, POST /reserve
- [x] Registrar todos os providers no `InventoryControlModule`
- [x] Registrar módulo no `AppModule`
