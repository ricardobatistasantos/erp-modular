# Requirements Document

## Introduction

Adicionar suporte a transações (transaction) nos repositórios do módulo de controle de estoque. Atualmente, os métodos dos repositórios utilizam `this.connection()` diretamente, sem aceitar um parâmetro opcional de transação. O padrão já existe em outros módulos do projeto (ex: product/category), onde métodos aceitam `transaction?: any` como último parâmetro e utilizam `const db = transaction || this.connection()`. Esta feature visa permitir que operações compostas no controle de estoque sejam executadas dentro de uma mesma transação de banco de dados, garantindo atomicidade.

## Glossary

- **Repository**: Classe de infraestrutura responsável pela persistência e recuperação de dados no banco de dados PostgreSQL via pg-promise.
- **Interface_Repository**: Contrato (interface TypeScript) que define os métodos disponíveis de um repositório no domínio.
- **Transaction**: Objeto de transação do pg-promise (`ITask<{}>`) que permite executar múltiplas queries dentro de uma mesma transação atômica de banco de dados.
- **Connection**: Função injetada (`this.connection()`) que retorna a instância de conexão pg-promise para execução de queries.
- **Método_de_Escrita**: Método de repositório que realiza INSERT ou UPDATE no banco de dados (create, upsert, update, updateStatus, createItem, updateItem, finalize).
- **Método_de_Leitura**: Método de repositório que realiza apenas SELECT no banco de dados (findById, findAll, findByProdutoId, findByDepositoId, findByOrigem, findItensByInventarioId, findItensByTransferenciaId, findByProdutoAndDeposito).

## Requirements

### Requirement 1: Suporte a Transaction nas Interfaces de Repositório

**User Story:** Como desenvolvedor, eu quero que as interfaces dos repositórios de controle de estoque aceitem um parâmetro opcional de transação, para que eu possa compor operações atômicas entre múltiplos repositórios.

#### Acceptance Criteria

1. THE Interface_Repository SHALL declarar o parâmetro `transaction?: any` como último parâmetro em todos os Método_de_Escrita (`create`, `upsert`, `update`, `updateStatus`, `finalize`, `createItem`, `updateItem`) dos seguintes repositórios: IMovimentoEstoqueRepository, ISaldoEstoqueRepository, IReservaEstoqueRepository, ITransferenciaEstoqueRepository, IInventarioRepository, IDepositoRepository, ICamadaCustoRepository.
2. THE Interface_Repository SHALL declarar o parâmetro `transaction?: any` como último parâmetro em todos os Método_de_Leitura (`findById`, `findAll`, `findByProdutoId`, `findByDepositoId`, `findByProdutoAndDeposito`, `findByOrigem`, `findItensByTransferenciaId`, `findItensByInventarioId`) dos seguintes repositórios: IMovimentoEstoqueRepository, ISaldoEstoqueRepository, IReservaEstoqueRepository, ITransferenciaEstoqueRepository, IInventarioRepository, IDepositoRepository, ICamadaCustoRepository.
3. THE Interface_Repository SHALL manter o parâmetro `transaction` como opcional (usando `?`) para preservar compatibilidade retroativa com chamadas existentes.
4. WHEN o parâmetro `transaction` for fornecido a um método do repositório, THE Implementação_Repository SHALL executar a operação utilizando a conexão transacional recebida em vez da conexão padrão.

### Requirement 2: Implementação do Suporte a Transaction nos Repositórios

**User Story:** Como desenvolvedor, eu quero que as implementações dos repositórios utilizem a transação quando fornecida, para que as queries sejam executadas dentro do contexto transacional correto.

#### Acceptance Criteria

1. WHEN o parâmetro `transaction` é fornecido em um método do Repository, THE Repository SHALL executar todas as queries daquele método utilizando o objeto `transaction` como conexão de banco de dados, garantindo que a operação participe da transação em andamento.
2. WHEN o parâmetro `transaction` não é fornecido (undefined ou null), THE Repository SHALL executar as queries utilizando `this.connection()` como conexão de banco de dados padrão.
3. THE Repository SHALL implementar o padrão `const db = transaction || this.connection()` em cada método que aceita o parâmetro de transação.
4. IF o parâmetro `transaction` é fornecido e a execução da query falha, THEN THE Repository SHALL propagar a exceção ao chamador sem realizar commit ou rollback, permitindo que o orquestrador da transação controle o desfecho.

### Requirement 3: Suporte a Transaction no MovimentoEstoqueRepository

**User Story:** Como desenvolvedor, eu quero que o MovimentoEstoqueRepository aceite transações, para que movimentos de estoque possam ser registrados atomicamente junto com outras operações.

#### Acceptance Criteria

1. WHEN uma transação é fornecida como parâmetro opcional ao método `create`, THE MovimentoEstoqueRepository SHALL executar o INSERT utilizando a transação fornecida em vez da conexão padrão.
2. WHEN uma transação é fornecida como parâmetro opcional ao método `findByProdutoId`, THE MovimentoEstoqueRepository SHALL executar o SELECT utilizando a transação fornecida em vez da conexão padrão.
3. WHEN uma transação é fornecida como parâmetro opcional ao método `findByOrigem`, THE MovimentoEstoqueRepository SHALL executar o SELECT utilizando a transação fornecida em vez da conexão padrão.
4. IF nenhuma transação for fornecida aos métodos `create`, `findByProdutoId` ou `findByOrigem`, THEN THE MovimentoEstoqueRepository SHALL executar a operação utilizando a conexão padrão do banco de dados.
5. THE IMovimentoEstoqueRepository SHALL declarar o parâmetro `transaction` como opcional (tipo `any`) nos métodos `create`, `findByProdutoId` e `findByOrigem`.

### Requirement 4: Suporte a Transaction no SaldoEstoqueRepository

**User Story:** Como desenvolvedor, eu quero que o SaldoEstoqueRepository aceite transações, para que atualizações de saldo possam ser feitas atomicamente junto com movimentos de estoque.

#### Acceptance Criteria

1. WHEN uma transação é fornecida como parâmetro opcional ao método `upsert`, THE SaldoEstoqueRepository SHALL executar o INSERT/UPDATE utilizando a transação fornecida em vez da conexão padrão.
2. WHEN uma transação é fornecida como parâmetro opcional ao método `findByProdutoId`, THE SaldoEstoqueRepository SHALL executar o SELECT utilizando a transação fornecida em vez da conexão padrão.
3. WHEN uma transação é fornecida como parâmetro opcional ao método `findByDepositoId`, THE SaldoEstoqueRepository SHALL executar o SELECT utilizando a transação fornecida em vez da conexão padrão.
4. WHEN uma transação é fornecida como parâmetro opcional ao método `findByProdutoAndDeposito`, THE SaldoEstoqueRepository SHALL executar o SELECT utilizando a transação fornecida em vez da conexão padrão.
5. WHEN nenhuma transação é fornecida aos métodos `upsert`, `findByProdutoId`, `findByDepositoId` ou `findByProdutoAndDeposito`, THE SaldoEstoqueRepository SHALL executar a operação utilizando a conexão padrão do banco de dados, mantendo o comportamento atual.
6. IF a transação fornecida for inválida ou já tiver sido encerrada, THEN THE SaldoEstoqueRepository SHALL propagar o erro lançado pelo driver de banco de dados ao chamador sem interceptá-lo.

### Requirement 5: Suporte a Transaction no ReservaEstoqueRepository

**User Story:** Como desenvolvedor, eu quero que o ReservaEstoqueRepository aceite transações, para que reservas possam ser criadas e atualizadas atomicamente dentro de fluxos de negócio.

#### Acceptance Criteria

1. WHEN uma transação é fornecida como parâmetro opcional ao método `create`, THE ReservaEstoqueRepository SHALL executar o INSERT utilizando a transação fornecida em vez da conexão padrão.
2. WHEN uma transação é fornecida como parâmetro opcional ao método `findByOrigem`, THE ReservaEstoqueRepository SHALL executar o SELECT utilizando a transação fornecida em vez da conexão padrão.
3. WHEN uma transação é fornecida como parâmetro opcional ao método `updateStatus`, THE ReservaEstoqueRepository SHALL executar o UPDATE utilizando a transação fornecida em vez da conexão padrão.
4. IF nenhuma transação for fornecida aos métodos `create`, `findByOrigem` ou `updateStatus`, THEN THE ReservaEstoqueRepository SHALL executar a operação utilizando a conexão padrão do banco de dados, mantendo o comportamento existente.
5. WHEN uma transação sofre rollback após a chamada de `create`, `findByOrigem` ou `updateStatus`, THE ReservaEstoqueRepository SHALL garantir que nenhuma alteração persista no banco de dados para as operações executadas dentro dessa transação.

### Requirement 6: Suporte a Transaction no TransferenciaEstoqueRepository

**User Story:** Como desenvolvedor, eu quero que o TransferenciaEstoqueRepository aceite transações, para que transferências possam ser coordenadas com outras operações de estoque.

#### Acceptance Criteria

1. WHEN uma transação é fornecida ao método `create`, THE TransferenciaEstoqueRepository SHALL utilizar a transação fornecida ao invés de criar uma transação interna com `db.tx()`.
2. WHEN uma transação não é fornecida ao método `create`, THE TransferenciaEstoqueRepository SHALL manter o comportamento atual utilizando `db.tx()` para garantir atomicidade interna.
3. WHEN uma transação é fornecida ao método `findById`, THE TransferenciaEstoqueRepository SHALL executar o SELECT utilizando a transação fornecida em vez da conexão padrão.
4. WHEN uma transação é fornecida ao método `updateStatus`, THE TransferenciaEstoqueRepository SHALL executar o UPDATE utilizando a transação fornecida em vez da conexão padrão.
5. WHEN uma transação é fornecida ao método `createItem`, THE TransferenciaEstoqueRepository SHALL executar o INSERT utilizando a transação fornecida em vez da conexão padrão.
6. WHEN uma transação é fornecida ao método `findItensByTransferenciaId`, THE TransferenciaEstoqueRepository SHALL executar o SELECT utilizando a transação fornecida em vez da conexão padrão.

### Requirement 7: Suporte a Transaction no InventarioRepository

**User Story:** Como desenvolvedor, eu quero que o InventarioRepository aceite transações, para que operações de inventário possam ser executadas atomicamente.

#### Acceptance Criteria

1. WHEN uma transação é fornecida ao método `create`, THE InventarioRepository SHALL executar o INSERT utilizando a transação fornecida em vez da conexão padrão.
2. WHEN uma transação é fornecida ao método `findById`, THE InventarioRepository SHALL executar o SELECT utilizando a transação fornecida em vez da conexão padrão.
3. WHEN uma transação é fornecida ao método `update`, THE InventarioRepository SHALL executar o UPDATE utilizando a transação fornecida em vez da conexão padrão.
4. WHEN uma transação é fornecida ao método `finalize`, THE InventarioRepository SHALL executar o UPDATE utilizando a transação fornecida em vez da conexão padrão.
5. WHEN uma transação é fornecida ao método `createItem`, THE InventarioRepository SHALL executar o INSERT utilizando a transação fornecida em vez da conexão padrão.
6. WHEN uma transação é fornecida ao método `findItensByInventarioId`, THE InventarioRepository SHALL executar o SELECT utilizando a transação fornecida em vez da conexão padrão.
7. WHEN uma transação é fornecida ao método `updateItem`, THE InventarioRepository SHALL executar o UPDATE utilizando a transação fornecida em vez da conexão padrão.
8. IF nenhuma transação é fornecida a qualquer método do InventarioRepository, THEN THE InventarioRepository SHALL executar a operação utilizando a conexão padrão do banco de dados.
9. THE IInventarioRepository SHALL declarar o parâmetro `transaction` como opcional (tipo `any`) em todos os métodos: `create`, `findById`, `update`, `finalize`, `createItem`, `findItensByInventarioId` e `updateItem`.

### Requirement 8: Suporte a Transaction no DepositoRepository

**User Story:** Como desenvolvedor, eu quero que o DepositoRepository aceite transações, para que operações de depósito possam participar de transações compostas.

#### Acceptance Criteria

1. WHEN uma transação é fornecida ao método `create`, THE DepositoRepository SHALL executar o INSERT utilizando a transação fornecida em vez da conexão padrão.
2. WHEN uma transação é fornecida ao método `findById`, THE DepositoRepository SHALL executar o SELECT utilizando a transação fornecida em vez da conexão padrão.
3. WHEN uma transação é fornecida ao método `findAll`, THE DepositoRepository SHALL executar o SELECT utilizando a transação fornecida em vez da conexão padrão.
4. WHEN uma transação é fornecida ao método `update`, THE DepositoRepository SHALL executar o UPDATE utilizando a transação fornecida em vez da conexão padrão.
5. IF nenhuma transação for fornecida aos métodos do DepositoRepository, THEN THE DepositoRepository SHALL executar a operação utilizando a conexão padrão do banco de dados.

### Requirement 9: Suporte a Transaction no CamadaCustoRepository

**User Story:** Como desenvolvedor, eu quero que o CamadaCustoRepository aceite transações, para que camadas de custo possam ser criadas atomicamente junto com movimentos de estoque.

#### Acceptance Criteria

1. WHEN uma transação é fornecida ao método `create`, THE CamadaCustoRepository SHALL executar o INSERT utilizando a transação fornecida em vez da conexão padrão.
2. WHEN uma transação é fornecida ao método `findByProdutoId`, THE CamadaCustoRepository SHALL executar o SELECT utilizando a transação fornecida em vez da conexão padrão.
3. WHEN nenhuma transação é fornecida aos métodos `create` ou `findByProdutoId`, THE CamadaCustoRepository SHALL executar a operação utilizando a conexão padrão do repositório, mantendo compatibilidade retroativa.
4. IF uma operação de banco de dados falhar durante a execução dentro de uma transação fornecida, THEN THE CamadaCustoRepository SHALL propagar o erro ao chamador sem capturá-lo, permitindo que a transação seja revertida pelo contexto que a controla.

### Requirement 10: Compatibilidade Retroativa

**User Story:** Como desenvolvedor, eu quero que todas as chamadas existentes aos repositórios continuem funcionando sem alteração, para que não haja quebra de código existente.

#### Acceptance Criteria

1. THE Repository SHALL manter a mesma assinatura de retorno (Promise types) em todos os métodos de todos os 7 repositórios (IMovimentoEstoqueRepository, ISaldoEstoqueRepository, IReservaEstoqueRepository, ITransferenciaEstoqueRepository, IInventarioRepository, IDepositoRepository, ICamadaCustoRepository) após a adição do parâmetro de transação.
2. IF nenhum parâmetro de transação é passado (undefined), THEN THE Repository SHALL executar as queries utilizando `this.connection()`, produzindo os mesmos resultados de consulta e efeitos de persistência que o comportamento anterior à adição do parâmetro.
3. THE Interface_Repository SHALL manter todos os métodos existentes sem alteração de nome ou ordem dos parâmetros originais, adicionando o parâmetro `transaction?: any` exclusivamente como último parâmetro de cada método.
4. THE Repository SHALL permitir que todo código existente que invoca métodos dos repositórios sem o parâmetro `transaction` continue compilando sem erros de tipo TypeScript e sem necessidade de alteração.
