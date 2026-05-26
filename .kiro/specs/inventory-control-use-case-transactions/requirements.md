# Requirements Document

## Introduction

Adicionar controle de transação (orquestração transacional) nos use cases do módulo de controle de estoque (`inventory-control`). Os repositórios já suportam o parâmetro opcional `transaction?: any` (implementado na spec `inventory-control-transactions`). Agora, os use cases que realizam operações compostas (múltiplas chamadas a repositórios) devem envolver essas operações em uma única transação de banco de dados via `db.tx()`, garantindo atomicidade. Se qualquer operação falhar, todas as alterações do use case são revertidas automaticamente.

O padrão já existe no módulo `finance/accounts-payable`, onde o use case injeta `DATABASE_CONNECTION` e utiliza `this.connection().tx(async (t) => { ... })` para orquestrar a transação, passando `t` como parâmetro para cada chamada de repositório.

## Glossary

- **Use_Case**: Classe de aplicação (service) que orquestra a lógica de negócio, coordenando chamadas a um ou mais repositórios para completar uma operação.
- **Operação_Composta**: Execução de um use case que envolve duas ou mais chamadas de escrita/leitura a repositórios distintos ou ao mesmo repositório, onde a consistência entre as operações é necessária.
- **Transaction**: Objeto de transação do pg-promise (`ITask<{}>`) obtido via `db.tx()`, que garante atomicidade — todas as operações dentro da transação são confirmadas (commit) ou revertidas (rollback) como uma unidade.
- **DATABASE_CONNECTION**: Token de injeção de dependência que fornece uma factory function para obter a conexão pg-promise. Uso: `this.connection().tx(async (t) => { ... })`.
- **Orquestrador**: O use case que cria a transação via `db.tx()` e é responsável por passar o objeto de transação aos repositórios e por controlar commit/rollback (implícito no pg-promise).
- **Use_Case_Simples**: Use case que realiza apenas uma chamada a repositório ou apenas leituras, não necessitando de controle transacional explícito.

## Requirements

### Requirement 1: Injeção de DATABASE_CONNECTION nos Use Cases Compostos

**User Story:** Como desenvolvedor, eu quero que os use cases compostos do módulo inventory-control tenham acesso à conexão de banco de dados, para que possam criar transações e orquestrar operações atômicas.

#### Acceptance Criteria

1. THE CreateMovimentoEstoqueUseCase SHALL receber a injeção do token `DATABASE_CONNECTION` via construtor, armazenando-o como propriedade privada `connection`.
2. THE CreateReservaEstoqueUseCase SHALL receber a injeção do token `DATABASE_CONNECTION` via construtor, armazenando-o como propriedade privada `connection`.
3. THE CreateInventarioUseCase SHALL receber a injeção do token `DATABASE_CONNECTION` via construtor, armazenando-o como propriedade privada `connection`.
4. THE FinalizarInventarioUseCase SHALL receber a injeção do token `DATABASE_CONNECTION` via construtor, armazenando-o como propriedade privada `connection`.
5. THE ReceberTransferenciaUseCase SHALL receber a injeção do token `DATABASE_CONNECTION` via construtor, armazenando-o como propriedade privada `connection`.

### Requirement 2: Orquestração Transacional no CreateMovimentoEstoqueUseCase

**User Story:** Como desenvolvedor, eu quero que a criação de movimento de estoque seja atômica, para que o movimento, a atualização de saldo e a camada de custo sejam todos persistidos ou todos revertidos em caso de falha.

#### Acceptance Criteria

1. WHEN o método `execute` é invocado, THE CreateMovimentoEstoqueUseCase SHALL envolver todas as operações de persistência (criação do movimento, upsert do saldo e, quando aplicável, criação da camada de custo) dentro de uma única transação obtida via `this.connection().tx()`.
2. WHEN a transação é criada, THE CreateMovimentoEstoqueUseCase SHALL passar o objeto de transação como último parâmetro em todas as chamadas aos repositórios `movimentoRepository.create()`, `saldoRepository.findByProdutoAndDeposito()`, `saldoRepository.upsert()` e `camadaCustoRepository.create()`.
3. IF qualquer operação de repositório falhar dentro da transação, THEN THE CreateMovimentoEstoqueUseCase SHALL garantir que nenhuma das operações da mesma transação seja persistida no banco de dados (rollback implícito do pg-promise), de modo que nem o movimento, nem o saldo, nem a camada de custo sejam observáveis após a falha.
4. WHEN a transação é concluída com sucesso, THE CreateMovimentoEstoqueUseCase SHALL retornar o objeto `MovimentoEstoque` criado com todos os campos preenchidos, mantendo o tipo de retorno `Promise<MovimentoEstoque>`.
5. IF o tipo de movimento não for de entrada (não pertencer à lista `TIPOS_ENTRADA`), THEN THE CreateMovimentoEstoqueUseCase SHALL executar a transação contendo apenas a criação do movimento e o upsert do saldo, sem invocar `camadaCustoRepository.create()`.

### Requirement 3: Orquestração Transacional no CreateReservaEstoqueUseCase

**User Story:** Como desenvolvedor, eu quero que a criação de reserva de estoque seja atômica, para que a reserva e a atualização do saldo reservado sejam consistentes.

#### Acceptance Criteria

1. WHEN o método `execute` é invocado, THE CreateReservaEstoqueUseCase SHALL executar a consulta de saldo (`saldoRepository.findByProdutoAndDeposito()`), a criação da reserva (`reservaRepository.create()`) e o upsert do saldo (`saldoRepository.upsert()`) dentro de uma única transação iniciada via `this.connection().tx()`.
2. WHEN a transação é criada, THE CreateReservaEstoqueUseCase SHALL passar o objeto de transação como último parâmetro nas chamadas `saldoRepository.findByProdutoAndDeposito()`, `reservaRepository.create()` e `saldoRepository.upsert()`.
3. IF qualquer operação de repositório lançar uma exceção dentro do callback da transação, THEN THE CreateReservaEstoqueUseCase SHALL permitir que a exceção se propague, causando rollback automático de todas as operações anteriores da mesma transação pelo pg-promise.
4. WHEN a transação é concluída com sucesso, THE CreateReservaEstoqueUseCase SHALL retornar o objeto `ReservaEstoque` criado como `Promise<ReservaEstoque>`.
5. WHEN o método `execute` é invocado, THE CreateReservaEstoqueUseCase SHALL executar as validações de existência de saldo e disponibilidade de quantidade dentro do escopo da transação, antes das operações de escrita, garantindo leitura consistente.

### Requirement 4: Orquestração Transacional no CreateInventarioUseCase

**User Story:** Como desenvolvedor, eu quero que a criação de inventário seja atômica, para que o inventário e todos os seus itens sejam criados juntos ou nenhum seja persistido.

#### Acceptance Criteria

1. WHEN o método `execute` é invocado, THE CreateInventarioUseCase SHALL envolver todas as operações de persistência (criação do inventário, consulta de saldos e criação dos itens) dentro de uma única transação via `this.connection().tx()`.
2. WHEN a transação é criada, THE CreateInventarioUseCase SHALL passar o objeto de transação como último parâmetro nas chamadas `inventarioRepository.create()`, `saldoRepository.findByDepositoId()` e `inventarioRepository.createItem()`.
3. IF qualquer operação de repositório falhar dentro da transação, THEN THE CreateInventarioUseCase SHALL reverter automaticamente todas as operações anteriores da mesma transação.
4. WHEN a transação é concluída com sucesso, THE CreateInventarioUseCase SHALL retornar o Inventario criado, mantendo o mesmo contrato de retorno existente.

### Requirement 5: Orquestração Transacional no FinalizarInventarioUseCase

**User Story:** Como desenvolvedor, eu quero que a finalização de inventário seja atômica, para que todos os movimentos de ajuste e a finalização do inventário sejam consistentes.

#### Acceptance Criteria

1. WHEN o método `execute` é invocado e o inventário existe com status "ABERTO", THE FinalizarInventarioUseCase SHALL envolver a criação de todos os movimentos de ajuste e a chamada a `inventarioRepository.finalize()` dentro de uma única transação obtida via `this.connection().tx()`.
2. WHEN a transação é criada, THE FinalizarInventarioUseCase SHALL passar o objeto de transação como parâmetro para o método `execute` do CreateMovimentoEstoqueUseCase e para `inventarioRepository.finalize()`, garantindo que todas as operações de escrita utilizem a mesma transação.
3. THE CreateMovimentoEstoqueUseCase SHALL aceitar um parâmetro opcional `transaction?: any` no método `execute`, permitindo que um orquestrador externo forneça uma transação já existente.
4. WHEN o CreateMovimentoEstoqueUseCase recebe uma transação externa via parâmetro, THE CreateMovimentoEstoqueUseCase SHALL repassar essa transação para todos os repositórios que invoca (`movimentoRepository.create`, `saldoRepository.upsert`, `saldoRepository.findByProdutoAndDeposito`, `camadaCustoRepository.create`) em vez de utilizar a conexão padrão.
5. IF qualquer operação dentro da transação lançar uma exceção durante a finalização, THEN THE FinalizarInventarioUseCase SHALL permitir que o `db.tx()` do pg-promise reverta automaticamente todas as operações já executadas na transação (rollback), e propagar a exceção ao chamador.
6. WHEN a transação é concluída com sucesso (commit), THE FinalizarInventarioUseCase SHALL retornar o objeto Inventario finalizado com status atualizado, mantendo o mesmo contrato de retorno `Promise<Inventario>` existente.
7. WHEN o CreateMovimentoEstoqueUseCase é invocado sem o parâmetro `transaction` (undefined), THE CreateMovimentoEstoqueUseCase SHALL manter o comportamento atual, utilizando a conexão padrão dos repositórios sem alteração na lógica existente.

### Requirement 6: Orquestração Transacional no ReceberTransferenciaUseCase

**User Story:** Como desenvolvedor, eu quero que o recebimento de transferência seja atômico, para que os movimentos de saída, entrada e a atualização de status sejam todos consistentes.

#### Acceptance Criteria

1. WHEN o método `execute` é invocado e a transferência é válida para recebimento, THE ReceberTransferenciaUseCase SHALL envolver todas as operações de persistência (criação dos movimentos de saída e entrada, e atualização de status) dentro de uma única transação via `this.connection().tx()`.
2. WHEN a transação é criada, THE ReceberTransferenciaUseCase SHALL passar o objeto de transação para o CreateMovimentoEstoqueUseCase e para `transferenciaRepository.updateStatus()`.
3. IF qualquer movimento de estoque falhar durante o recebimento, THEN THE ReceberTransferenciaUseCase SHALL reverter automaticamente todos os movimentos já criados e a atualização de status.
4. WHEN a transação é concluída com sucesso, THE ReceberTransferenciaUseCase SHALL retornar a TransferenciaEstoque atualizada, mantendo o mesmo contrato de retorno existente.

### Requirement 7: Suporte a Transação Externa no CreateMovimentoEstoqueUseCase

**User Story:** Como desenvolvedor, eu quero que o CreateMovimentoEstoqueUseCase aceite uma transação externa opcional, para que possa participar de transações orquestradas por outros use cases (FinalizarInventario, ReceberTransferencia).

#### Acceptance Criteria

1. THE CreateMovimentoEstoqueUseCase SHALL aceitar um segundo parâmetro opcional `transaction?: any` no método `execute`.
2. WHEN uma transação externa é fornecida ao método `execute`, THE CreateMovimentoEstoqueUseCase SHALL passar essa transação como último argumento em todas as chamadas de repositório (`movimentoRepository.create`, `saldoRepository.findByProdutoAndDeposito`, `saldoRepository.upsert`, `camadaCustoRepository.create`), sem criar uma nova transação interna.
3. WHEN nenhuma transação externa é fornecida ao método `execute`, THE CreateMovimentoEstoqueUseCase SHALL criar sua própria transação via a conexão de banco de dados (`connection().tx()`) e executar todas as operações de repositório (`movimentoRepository.create`, `saldoRepository.findByProdutoAndDeposito`, `saldoRepository.upsert`, `camadaCustoRepository.create`) dentro dessa transação única para garantir atomicidade interna.
4. THE CreateMovimentoEstoqueUseCase SHALL manter o mesmo contrato de retorno (`Promise<MovimentoEstoque>`) independentemente de receber ou não uma transação externa.
5. IF uma chamada de repositório falhar durante a execução com transação externa, THEN THE CreateMovimentoEstoqueUseCase SHALL propagar o erro ao chamador sem interceptá-lo, sem realizar commit ou rollback, delegando o controle da transação ao orquestrador externo.
6. IF uma chamada de repositório falhar durante a execução com transação interna (criada pelo próprio use case), THEN THE CreateMovimentoEstoqueUseCase SHALL realizar rollback automático de todas as operações executadas dentro dessa transação.

### Requirement 8: Validações Pré-Transação

**User Story:** Como desenvolvedor, eu quero que validações de negócio que não dependem de estado transacional sejam executadas antes de iniciar a transação, para evitar transações desnecessárias em caso de dados inválidos.

#### Acceptance Criteria

1. WHEN o FinalizarInventarioUseCase recebe uma requisição, THE FinalizarInventarioUseCase SHALL executar a busca do inventário por ID e a validação de que o status é ABERTO antes de invocar `db.tx()`, lançando exceção sem iniciar transação caso o inventário não seja encontrado ou o status seja diferente de ABERTO.
2. WHEN o ReceberTransferenciaUseCase recebe uma requisição, THE ReceberTransferenciaUseCase SHALL executar a busca da transferência por ID e a validação de que o status é EM_TRANSITO ou SEPARADA antes de invocar `db.tx()`, lançando exceção sem iniciar transação caso a transferência não seja encontrada ou o status seja inválido para recebimento.
3. WHEN o CreateReservaEstoqueUseCase recebe uma requisição, THE CreateReservaEstoqueUseCase SHALL executar a leitura do saldo e a validação de saldo disponível dentro da transação (via `db.tx()`), pois a leitura do saldo deve ser transacional para evitar race conditions na verificação de disponibilidade.
4. IF o FinalizarInventarioUseCase ou o ReceberTransferenciaUseCase lança exceção na fase de validação pré-transação, THEN o use case SHALL garantir que nenhuma transação de banco de dados foi aberta (nenhuma chamada a `db.tx()` foi realizada).

### Requirement 9: Compatibilidade Retroativa dos Use Cases

**User Story:** Como desenvolvedor, eu quero que as interfaces públicas dos use cases permaneçam compatíveis, para que controllers e outros consumidores não precisem de alteração.

#### Acceptance Criteria

1. THE CreateMovimentoEstoqueUseCase SHALL manter o parâmetro `transaction` como opcional no método `execute`, de modo que chamadas existentes sem o argumento `transaction` continuem compilando e produzindo o mesmo tipo de retorno (`Promise<MovimentoEstoque>`) e os mesmos efeitos colaterais (criação de movimento, atualização de saldo, criação de camada de custo).
2. THE CreateReservaEstoqueUseCase SHALL manter a mesma assinatura pública do método `execute` (recebendo `CreateReservaEstoqueDto` como único parâmetro obrigatório e retornando `Promise<ReservaEstoque>`), preservando a interface `BaseUseCase<CreateReservaEstoqueDto, ReservaEstoque>`.
3. THE CreateInventarioUseCase SHALL manter a mesma assinatura pública do método `execute` (recebendo `CreateInventarioDto` como único parâmetro obrigatório e retornando `Promise<Inventario>`), preservando a interface `BaseUseCase<CreateInventarioDto, Inventario>`.
4. THE FinalizarInventarioUseCase SHALL manter a mesma assinatura pública do método `execute` (recebendo `FinalizarInventarioDto` como único parâmetro obrigatório e retornando `Promise<Inventario>`), preservando a interface `BaseUseCase<FinalizarInventarioDto, Inventario>`.
5. THE ReceberTransferenciaUseCase SHALL manter a mesma assinatura pública do método `execute` (recebendo `ReceberTransferenciaDto` como único parâmetro obrigatório e retornando `Promise<TransferenciaEstoque>`), preservando a interface `BaseUseCase<ReceberTransferenciaDto, TransferenciaEstoque>`.
6. THE GetSaldoByProdutoUseCase SHALL manter a assinatura `execute(produtoId: string): Promise<SaldoEstoque[]>` inalterada, sem adição de parâmetro `transaction`, pois realiza apenas uma leitura simples sem necessidade de controle transacional.
7. THE CreateTransferenciaUseCase SHALL manter a assinatura `execute(data: CreateTransferenciaDto): Promise<TransferenciaEstoque>` inalterada, sem adição de parâmetro `transaction`, pois delega a atomicidade ao `TransferenciaEstoqueRepository.create` que já gerencia sua própria transação interna.
8. WHEN qualquer use case listado nos critérios 1 a 7 for invocado sem o argumento `transaction`, THE sistema SHALL produzir o mesmo comportamento observável (valores de retorno em caso de sucesso e exceções HTTP com os mesmos status codes em caso de erro) que produzia antes da adição do suporte transacional.
