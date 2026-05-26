# Implementation Plan: Inventory Control Use Case Transactions

## Overview

Adicionar orquestração transacional nos 5 use cases compostos do módulo `inventory-control`, injetando `DATABASE_CONNECTION` e envolvendo operações de escrita em `connection().tx()`. O `CreateMovimentoEstoqueUseCase` é implementado primeiro por ser dependência dos orquestradores (`FinalizarInventarioUseCase`, `ReceberTransferenciaUseCase`) que passam transação externa.

## Tasks

- [x] 1. Implementar transação no CreateMovimentoEstoqueUseCase (com suporte a transação externa)
  - [x] 1.1 Injetar DATABASE_CONNECTION e implementar orquestração transacional com delegação condicional
    - Adicionar `@Inject('DATABASE_CONNECTION') private readonly connection: any` ao construtor
    - Adicionar parâmetro opcional `transaction?: any` ao método `execute`
    - Extrair lógica de persistência para função interna `operation(t)`
    - Implementar condicional: se `transaction` fornecido, chamar `operation(transaction)`; senão, chamar `this.connection().tx(operation)`
    - Passar `t` como último argumento em todas as chamadas: `movimentoRepository.create(movimento, t)`, `saldoRepository.findByProdutoAndDeposito(produtoId, depositoId, t)`, `saldoRepository.upsert(saldo, t)`, `camadaCustoRepository.create(camada, t)`
    - Manter retorno `Promise<MovimentoEstoque>` inalterado
    - _Requirements: 1.1, 2.1, 2.2, 2.3, 2.4, 2.5, 5.3, 5.4, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 9.1_

- [x] 2. Implementar transação no CreateReservaEstoqueUseCase e CreateInventarioUseCase
  - [x] 2.1 Injetar DATABASE_CONNECTION e implementar orquestração transacional no CreateReservaEstoqueUseCase
    - Adicionar `@Inject('DATABASE_CONNECTION') private readonly connection: any` ao construtor
    - Envolver toda a lógica do `execute` em `this.connection().tx(async (t) => { ... })`
    - Mover leitura de saldo (`saldoRepository.findByProdutoAndDeposito`) para DENTRO da transação (evitar race condition)
    - Passar `t` em: `saldoRepository.findByProdutoAndDeposito(produtoId, depositoId, t)`, `reservaRepository.create(reserva, t)`, `saldoRepository.upsert(saldo, t)`
    - Manter validações de saldo (existência e disponibilidade) dentro do escopo transacional
    - Manter retorno `Promise<ReservaEstoque>` inalterado
    - _Requirements: 1.2, 3.1, 3.2, 3.3, 3.4, 3.5, 8.3, 9.2_

  - [x] 2.2 Injetar DATABASE_CONNECTION e implementar orquestração transacional no CreateInventarioUseCase
    - Adicionar `@Inject('DATABASE_CONNECTION') private readonly connection: any` ao construtor
    - Envolver toda a lógica do `execute` em `this.connection().tx(async (t) => { ... })`
    - Passar `t` em: `inventarioRepository.create(inventario, t)`, `saldoRepository.findByDepositoId(depositoId, t)`, `inventarioRepository.createItem(item, t)`
    - Manter retorno `Promise<Inventario>` inalterado
    - _Requirements: 1.3, 4.1, 4.2, 4.3, 4.4, 9.3_

- [x] 3. Implementar transação nos use cases orquestradores (dependem de CreateMovimentoEstoqueUseCase com transação externa)
  - [x] 3.1 Injetar DATABASE_CONNECTION e implementar orquestração transacional no FinalizarInventarioUseCase
    - Adicionar `@Inject('DATABASE_CONNECTION') private readonly connection: any` ao construtor
    - Implementar validação PRÉ-transação: buscar inventário por ID e verificar status ABERTO antes de chamar `tx()`
    - Lançar `HttpException(NOT_FOUND)` se inventário não encontrado, SEM abrir transação
    - Lançar `HttpException(BAD_REQUEST)` se status != ABERTO, SEM abrir transação
    - Buscar itens do inventário antes da transação
    - Envolver loop de movimentos + finalização em `this.connection().tx(async (t) => { ... })`
    - Chamar `createMovimentoEstoqueUseCase.execute(dto, t)` passando transação externa para cada item com divergência
    - Chamar `inventarioRepository.finalize(inventarioId, t)` dentro da transação
    - Manter retorno `Promise<Inventario>` inalterado
    - _Requirements: 1.4, 5.1, 5.2, 5.5, 5.6, 8.1, 8.4, 9.4_

  - [x] 3.2 Injetar DATABASE_CONNECTION e implementar orquestração transacional no ReceberTransferenciaUseCase
    - Adicionar `@Inject('DATABASE_CONNECTION') private readonly connection: any` ao construtor
    - Implementar validação PRÉ-transação: buscar transferência por ID e verificar status EM_TRANSITO ou SEPARADA antes de chamar `tx()`
    - Lançar `HttpException(NOT_FOUND)` se transferência não encontrada, SEM abrir transação
    - Lançar `HttpException(BAD_REQUEST)` se status inválido para recebimento, SEM abrir transação
    - Buscar itens da transferência antes da transação
    - Envolver loop de movimentos + updateStatus em `this.connection().tx(async (t) => { ... })`
    - Chamar `createMovimentoEstoqueUseCase.execute(dtoSaida, t)` e `createMovimentoEstoqueUseCase.execute(dtoEntrada, t)` para cada item
    - Chamar `transferenciaRepository.updateStatus(id, RECEBIDA, t)` dentro da transação
    - Manter retorno `Promise<TransferenciaEstoque>` inalterado
    - _Requirements: 1.5, 6.1, 6.2, 6.3, 6.4, 8.2, 8.4, 9.5_

- [x] 4. Checkpoint — Compilação
  - Ensure all tests pass, ask the user if questions arise.
  - Executar `npx tsc --noEmit` para verificar que todos os use cases compilam corretamente com as novas injeções e parâmetros de transação
  - Verificar que nenhum controller ou consumidor existente quebrou (compatibilidade retroativa)
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_

- [x] 5. Testes de propriedade (property-based)
  - [ ]* 5.1 Write property test: Orquestração transacional — todos os repositórios recebem a transação
    - **Property 1: Orquestração transacional — todos os repositórios recebem a transação**
    - **Validates: Requirements 2.1, 2.2, 3.1, 3.2, 4.1, 4.2, 5.1, 5.2, 6.1, 6.2**
    - Usar fast-check para gerar DTOs aleatórios para cada use case
    - Mockar `connection().tx()` para capturar o objeto `t`
    - Verificar que todas as chamadas de repositório recebem `t` como último argumento

  - [ ]* 5.2 Write property test: Delegação de transação externa no CreateMovimentoEstoqueUseCase
    - **Property 2: Delegação de transação externa no CreateMovimentoEstoqueUseCase**
    - **Validates: Requirements 5.3, 5.4, 5.7, 7.1, 7.2, 7.3**
    - Gerar DTOs aleatórios + presença/ausência de transação externa (fc.boolean())
    - Verificar que `connection().tx()` é chamado condicionalmente
    - Verificar que repos recebem a transação correta (interna ou externa)

  - [ ]* 5.3 Write property test: Propagação de erros sem interceptação
    - **Property 3: Propagação de erros sem interceptação**
    - **Validates: Requirements 2.3, 3.3, 4.3, 5.5, 6.3, 7.5, 7.6**
    - Gerar DTOs aleatórios + ponto de falha aleatório (qual repositório falha)
    - Verificar que o erro propaga sem ser capturado (rejects com o mesmo erro)

  - [ ]* 5.4 Write property test: Validação pré-transação evita abertura de transação
    - **Property 4: Validação pré-transação evita abertura de transação**
    - **Validates: Requirements 8.1, 8.2, 8.4**
    - Gerar inputs inválidos (id inexistente, status errado) para FinalizarInventario e ReceberTransferencia
    - Verificar que `connection().tx()` nunca é chamado quando validação falha

  - [ ]* 5.5 Write property test: Lógica condicional de camada de custo
    - **Property 5: Lógica condicional de camada de custo**
    - **Validates: Requirements 2.5**
    - Gerar tipos de movimento aleatórios
    - Verificar que `camadaCustoRepository.create` é chamado se e somente se tipo ∈ TIPOS_ENTRADA

  - [ ]* 5.6 Write property test: Invariante de retorno independente do modo de transação
    - **Property 6: Invariante de retorno independente do modo de transação**
    - **Validates: Requirements 2.4, 5.6, 7.4, 9.1**
    - Gerar DTOs aleatórios com e sem transação externa
    - Verificar que o retorno tem a mesma estrutura `MovimentoEstoque` em ambos os casos

- [x] 6. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
  - Executar `npm test` para verificar que todos os testes (unitários e property-based) passam
  - _Requirements: All_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- O padrão de transação condicional (`if (transaction) { operation(transaction) } else { connection().tx(operation) }`) é exclusivo do CreateMovimentoEstoqueUseCase
- Use cases simples (GetSaldoByProdutoUseCase, CreateTransferenciaUseCase) NÃO são modificados
- Os repositórios já suportam `transaction?: any` — esta spec apenas adiciona a orquestração no nível dos use cases

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1", "2.2"] },
    { "id": 2, "tasks": ["3.1", "3.2"] },
    { "id": 3, "tasks": ["4"] },
    { "id": 4, "tasks": ["5.1", "5.2", "5.3", "5.4", "5.5", "5.6"] },
    { "id": 5, "tasks": ["6"] }
  ]
}
```
