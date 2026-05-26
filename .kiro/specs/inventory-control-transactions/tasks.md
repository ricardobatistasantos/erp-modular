# Implementation Plan: Inventory Control Transactions

## Overview

Adicionar suporte a transações (`transaction?: any`) nos 7 repositórios do módulo de controle de estoque. A implementação segue o padrão `const db = transaction || this.connection()` já existente no projeto. O caso especial é `TransferenciaEstoqueRepository.create`, que usa lógica condicional para decidir entre transação externa e `db.tx()` interno.

## Tasks

- [x] 1. Atualizar interfaces de domínio com parâmetro transaction
  - [x] 1.1 Adicionar `transaction?: any` em IMovimentoEstoqueRepository
    - Adicionar parâmetro `transaction?: any` como último parâmetro nos métodos `create`, `findByProdutoId` e `findByOrigem`
    - Arquivo: `src/modules/inventory-control/src/domain/repository/movimento-estoque.repository.ts`
    - _Requirements: 1.1, 1.2, 1.3, 3.5_

  - [x] 1.2 Adicionar `transaction?: any` em ISaldoEstoqueRepository
    - Adicionar parâmetro `transaction?: any` como último parâmetro nos métodos `upsert`, `findByProdutoId`, `findByDepositoId` e `findByProdutoAndDeposito`
    - Arquivo: `src/modules/inventory-control/src/domain/repository/saldo-estoque.repository.ts`
    - _Requirements: 1.1, 1.2, 1.3, 10.3_

  - [x] 1.3 Adicionar `transaction?: any` em IReservaEstoqueRepository
    - Adicionar parâmetro `transaction?: any` como último parâmetro nos métodos `create`, `findByOrigem` e `updateStatus`
    - Arquivo: `src/modules/inventory-control/src/domain/repository/reserva-estoque.repository.ts`
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 1.4 Adicionar `transaction?: any` em ITransferenciaEstoqueRepository
    - Adicionar parâmetro `transaction?: any` como último parâmetro nos métodos `create`, `findById`, `updateStatus`, `createItem` e `findItensByTransferenciaId`
    - Arquivo: `src/modules/inventory-control/src/domain/repository/transferencia-estoque.repository.ts`
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 1.5 Adicionar `transaction?: any` em IInventarioRepository
    - Adicionar parâmetro `transaction?: any` como último parâmetro nos métodos `create`, `findById`, `finalize`, `update`, `createItem`, `findItensByInventarioId` e `updateItem`
    - Arquivo: `src/modules/inventory-control/src/domain/repository/inventario.repository.ts`
    - _Requirements: 1.1, 1.2, 1.3, 7.9_

  - [x] 1.6 Adicionar `transaction?: any` em IDepositoRepository
    - Adicionar parâmetro `transaction?: any` como último parâmetro nos métodos `create`, `findById`, `findAll` e `update`
    - Arquivo: `src/modules/inventory-control/src/domain/repository/deposito.repository.ts`
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 1.7 Adicionar `transaction?: any` em ICamadaCustoRepository
    - Adicionar parâmetro `transaction?: any` como último parâmetro nos métodos `create` e `findByProdutoId`
    - Arquivo: `src/modules/inventory-control/src/domain/repository/camada-custo.repository.ts`
    - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Implementar suporte a transaction nos repositórios de infraestrutura (Grupo 1)
  - [x] 2.1 Atualizar MovimentoEstoqueRepository com padrão transaction
    - Adicionar parâmetro `transaction?: any` nos métodos `create`, `findByProdutoId` e `findByOrigem`
    - Substituir `const db = this.connection()` por `const db = transaction || this.connection()` em cada método
    - Arquivo: `src/modules/inventory-control/src/infra/repository/movimento-estoque.repository.ts`
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4_

  - [x] 2.2 Atualizar SaldoEstoqueRepository com padrão transaction
    - Adicionar parâmetro `transaction?: any` nos métodos `upsert`, `findByProdutoId`, `findByDepositoId` e `findByProdutoAndDeposito`
    - Substituir `const db = this.connection()` por `const db = transaction || this.connection()` em cada método
    - Arquivo: `src/modules/inventory-control/src/infra/repository/saldo-estoque.repository.ts`
    - _Requirements: 2.1, 2.2, 2.3, 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 2.3 Atualizar ReservaEstoqueRepository com padrão transaction
    - Adicionar parâmetro `transaction?: any` nos métodos `create`, `findByOrigem` e `updateStatus`
    - Substituir `const db = this.connection()` por `const db = transaction || this.connection()` em cada método
    - Arquivo: `src/modules/inventory-control/src/infra/repository/reserva-estoque.repository.ts`
    - _Requirements: 2.1, 2.2, 2.3, 5.1, 5.2, 5.3, 5.4_

- [x] 3. Implementar suporte a transaction nos repositórios de infraestrutura (Grupo 2)
  - [x] 3.1 Atualizar TransferenciaEstoqueRepository com padrão transaction (caso especial)
    - Adicionar parâmetro `transaction?: any` nos métodos `create`, `findById`, `updateStatus`, `createItem` e `findItensByTransferenciaId`
    - Para `findById`, `updateStatus`, `createItem`, `findItensByTransferenciaId`: usar `const db = transaction || this.connection()`
    - Para `create`: implementar lógica condicional — se `transaction` fornecida, usar diretamente sem `db.tx()`; se não fornecida, manter `db.tx()` atual
    - Arquivo: `src/modules/inventory-control/src/infra/repository/transferencia-estoque.repository.ts`
    - _Requirements: 2.1, 2.2, 2.3, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [x] 3.2 Atualizar InventarioRepository com padrão transaction
    - Adicionar parâmetro `transaction?: any` nos métodos `create`, `findById`, `update`, `finalize`, `createItem`, `findItensByInventarioId` e `updateItem`
    - Substituir `const db = this.connection()` por `const db = transaction || this.connection()` em cada método
    - Arquivo: `src/modules/inventory-control/src/infra/repository/inventario.repository.ts`
    - _Requirements: 2.1, 2.2, 2.3, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_

  - [x] 3.3 Atualizar DepositoRepository com padrão transaction
    - Adicionar parâmetro `transaction?: any` nos métodos `create`, `findById`, `findAll` e `update`
    - Substituir `const db = this.connection()` por `const db = transaction || this.connection()` em cada método
    - Arquivo: `src/modules/inventory-control/src/infra/repository/deposito.repository.ts`
    - _Requirements: 2.1, 2.2, 2.3, 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x] 3.4 Atualizar CamadaCustoRepository com padrão transaction
    - Adicionar parâmetro `transaction?: any` nos métodos `create` e `findByProdutoId`
    - Substituir `const db = this.connection()` por `const db = transaction || this.connection()` em cada método
    - Arquivo: `src/modules/inventory-control/src/infra/repository/camada-custo.repository.ts`
    - _Requirements: 2.1, 2.2, 2.3, 9.1, 9.2, 9.3_

- [x] 4. Checkpoint - Verificar compilação e compatibilidade
  - Ensure all tests pass, ask the user if questions arise.
  - Verificar que o projeto compila sem erros TypeScript
  - Verificar que chamadas existentes sem transaction continuam funcionando
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 5. Testes de propriedade e unitários
  - [ ]* 5.1 Escrever property test para Property 1: Delegação de conexão
    - **Property 1: Delegação de conexão**
    - **Validates: Requirements 1.4, 2.1, 2.2, 2.3, 3.1-3.4, 4.1-4.5, 5.1-5.4, 7.1-7.8, 8.1-8.5, 9.1-9.3, 10.2**
    - Usar fast-check para gerar combinações aleatórias de (repositório, método, presença/ausência de transaction)
    - Verificar que quando transaction é fornecida, as queries usam o objeto transaction; quando não fornecida, usam this.connection()
    - Criar mocks do pg-promise para interceptar chamadas
    - Arquivo: `src/modules/inventory-control/tests/unit/repository-transaction-delegation.spec.ts`

  - [ ]* 5.2 Escrever property test para Property 2: Propagação de erros em transação
    - **Property 2: Propagação de erros em transação**
    - **Validates: Requirements 2.4, 4.6, 5.5, 9.4**
    - Usar fast-check para gerar erros aleatórios e verificar que são propagados sem modificação
    - Verificar que nenhum try/catch intercepta erros nas queries
    - Arquivo: `src/modules/inventory-control/tests/unit/repository-transaction-error-propagation.spec.ts`

  - [ ]* 5.3 Escrever property test para Property 3: TransferenciaEstoque.create — transação condicional
    - **Property 3: TransferenciaEstoque.create — transação condicional**
    - **Validates: Requirements 6.1, 6.2**
    - Usar fast-check para gerar dados aleatórios de transferência e itens
    - Verificar que com transaction fornecida, `db.tx()` NÃO é chamado e INSERTs usam a transação
    - Verificar que sem transaction, `db.tx()` É chamado para garantir atomicidade interna
    - Arquivo: `src/modules/inventory-control/tests/unit/transferencia-estoque-create-transaction.spec.ts`

  - [ ]* 5.4 Escrever testes unitários para compatibilidade retroativa
    - Testar que cada um dos 28 métodos pode ser chamado sem o parâmetro transaction
    - Testar que os tipos de retorno permanecem inalterados
    - Verificar que o TypeScript compila sem erros para chamadas existentes
    - Arquivo: `src/modules/inventory-control/tests/unit/repository-backward-compatibility.spec.ts`
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 6. Checkpoint final - Garantir que todos os testes passam
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marcadas com `*` são opcionais e podem ser puladas para um MVP mais rápido
- Cada task referencia requisitos específicos para rastreabilidade
- Checkpoints garantem validação incremental
- Property tests validam propriedades universais de correção
- Testes unitários validam exemplos específicos e edge cases
- O padrão `const db = transaction || this.connection()` é idêntico ao já usado em `CategoryRepository`
- O caso especial de `TransferenciaEstoqueRepository.create` requer lógica condicional (if/else) ao invés do padrão simples

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3", "1.4", "1.5", "1.6", "1.7"] },
    { "id": 1, "tasks": ["2.1", "2.2", "2.3", "3.1", "3.2", "3.3", "3.4"] },
    { "id": 2, "tasks": ["5.1", "5.2", "5.3", "5.4"] }
  ]
}
```
