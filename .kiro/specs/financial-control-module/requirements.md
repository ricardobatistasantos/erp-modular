# Documento de Requisitos - Módulo de Controle Financeiro

## Introdução

Reestruturação do módulo de controle financeiro (`src/modules/finance/`) para seguir o mesmo padrão arquitetural utilizado nos módulos de cliente (`src/modules/person/client/`) e funcionário (`src/modules/person/employee/`). O módulo financeiro atual possui apenas código esqueleto (use-cases vazios, sem entidades, sem repositórios implementados, sem DTOs). O objetivo é implementar completamente cada submódulo financeiro seguindo a arquitetura limpa com as camadas: domain (entity, repository interface, use-case interface), application (DTOs, use-cases concretos), infra (repository implementations) e presentation (controllers).

## Glossário

- **Sistema_Financeiro**: Conjunto de submódulos que compõem o controle financeiro do ERP
- **Contas_Pagar**: Submódulo responsável pelo gerenciamento de contas a pagar
- **Contas_Receber**: Submódulo responsável pelo gerenciamento de contas a receber
- **Plano_Contas**: Submódulo responsável pela estrutura hierárquica do plano de contas contábil
- **Centro_Custos**: Submódulo responsável pelo gerenciamento de centros de custo
- **Categorias_Financeiras**: Submódulo responsável pelas categorias financeiras vinculadas ao plano de contas
- **Lancamentos_Financeiros**: Submódulo responsável pelos lançamentos financeiros (débitos e créditos)
- **Baixas_Financeiras**: Submódulo responsável pelo registro de pagamentos/recebimentos efetivos
- **Parcelas**: Submódulo responsável pelo parcelamento de contas a pagar e receber
- **Repositorio**: Interface de acesso a dados definida na camada de domínio e implementada na camada de infraestrutura
- **UseCase**: Classe de aplicação que implementa a interface BaseUseCase<I, O> com método execute
- **DTO**: Data Transfer Object utilizado para transferência de dados entre camadas
- **Entidade**: Classe de domínio que representa um objeto de negócio
- **Transacao**: Operação atômica no banco de dados utilizando pg-promise transactions

## Requisitos

### Requisito 1: Estrutura Arquitetural dos Submódulos Financeiros

**User Story:** Como desenvolvedor, eu quero que cada submódulo financeiro siga a mesma estrutura de pastas e padrões dos módulos cliente e funcionário, para que o código seja consistente e manutenível.

#### Critérios de Aceitação

1. THE Sistema_Financeiro SHALL organizar cada submódulo com a estrutura: `src/` contendo `domain/` (entity, repository, use-case), `application/` (dto, use-cases), `infra/` (repository), `presentation/` (controllers) e `tests/`
2. THE Sistema_Financeiro SHALL definir uma interface BaseUseCase<I, O> com método execute na camada domain/use-case de cada submódulo
3. THE Sistema_Financeiro SHALL registrar repositórios como providers no módulo NestJS utilizando tokens de injeção de dependência no formato string (ex: 'IContasPagarRepository')
4. THE Sistema_Financeiro SHALL utilizar a conexão de banco de dados injetada via token 'DATABASE_CONNECTION' em todos os repositórios
5. THE Sistema_Financeiro SHALL utilizar transações pg-promise (connection().tx) para operações que envolvam múltiplas escritas no banco de dados

### Requisito 2: Submódulo Plano de Contas

**User Story:** Como usuário do sistema financeiro, eu quero gerenciar o plano de contas contábil, para que eu possa classificar receitas, despesas e patrimônio de forma hierárquica.

#### Critérios de Aceitação

1. WHEN uma requisição POST é recebida em `/chart-of-accounts` com campos válidos (codigo: string até 20 caracteres, nome: string até 150 caracteres, tipo: SINTETICA ou ANALITICA, natureza: RECEITA, DESPESA, ATIVO, PASSIVO ou PATRIMONIO, contaPaiId: uuid opcional, aceitaLancamento: boolean), THE Plano_Contas SHALL criar uma nova conta e retornar os dados da conta criada incluindo o id gerado
2. WHEN uma requisição GET é recebida em `/chart-of-accounts/:id`, THE Plano_Contas SHALL retornar os dados da conta (id, codigo, nome, tipo, natureza, contaPaiId, aceitaLancamento, ativo, createdAt, updatedAt) incluindo os dados da conta pai quando existir
3. WHEN uma requisição GET é recebida em `/chart-of-accounts` com parâmetros opcionais de paginação, THE Plano_Contas SHALL retornar a lista paginada de contas com metadados de paginação (total, page, limit, totalPages), utilizando valores padrão de page=1 e limit=10 quando não informados
4. WHEN uma requisição PUT é recebida em `/chart-of-accounts/:id` com campos válidos, THE Plano_Contas SHALL atualizar somente os campos enviados na requisição, preservando os valores anteriores dos campos não informados
5. IF uma conta com o id informado não existir em operações GET por id ou PUT, THEN THE Plano_Contas SHALL retornar erro 404 com mensagem indicando que a conta não foi encontrada
6. THE Plano_Contas SHALL definir a entidade ChartOfAccounts com os campos: id (uuid), codigo (varchar 20, obrigatório, único), nome (varchar 150, obrigatório), tipo (enum SINTETICA/ANALITICA, obrigatório), natureza (enum RECEITA/DESPESA/ATIVO/PASSIVO/PATRIMONIO, obrigatório), contaPaiId (uuid, opcional), aceitaLancamento (boolean, obrigatório, padrão true), ativo (boolean, obrigatório, padrão true), createdAt (timestamp), updatedAt (timestamp)
7. IF a requisição POST ou PUT contiver campos obrigatórios ausentes, valores de enum inválidos para tipo ou natureza, ou contaPaiId referenciando uma conta inexistente, THEN THE Plano_Contas SHALL retornar erro 400 com mensagem indicando os campos inválidos
8. IF uma requisição POST contiver um codigo que já existe no plano de contas, THEN THE Plano_Contas SHALL retornar erro 409 com mensagem indicando que o código já está em uso

### Requisito 3: Submódulo Centro de Custos

**User Story:** Como usuário do sistema financeiro, eu quero gerenciar centros de custo, para que eu possa alocar despesas e receitas por departamento ou projeto.

#### Critérios de Aceitação

1. WHEN uma requisição POST é recebida em `/cost-centers` com código (máximo 20 caracteres) e nome (máximo 100 caracteres) obrigatórios, descrição opcional (máximo 255 caracteres) e centroPaiId opcional, THE Centro_Custos SHALL criar um novo centro de custo com campo ativo inicializado como true e retornar os dados do registro criado
2. WHEN uma requisição GET é recebida em `/cost-centers/:id`, THE Centro_Custos SHALL retornar os dados completos do centro de custo incluindo id, codigo, nome, descricao, centroPaiId e ativo
3. WHEN uma requisição GET é recebida em `/cost-centers` com parâmetros page (padrão 1) e limit (padrão 10, máximo 100), THE Centro_Custos SHALL retornar a lista paginada de centros de custo com metadados de paginação (total, page, limit, totalPages)
4. WHEN uma requisição PUT é recebida em `/cost-centers/:id`, THE Centro_Custos SHALL atualizar os dados do centro de custo utilizando COALESCE para preservar valores existentes quando campos não são informados
5. IF um centro de custo com o id informado não existir em operações GET ou PUT, THEN THE Centro_Custos SHALL retornar erro 404 com mensagem indicando que o centro de custo não foi encontrado
6. THE Centro_Custos SHALL definir a entidade CostCenter com os campos: id, codigo, nome, descricao, centroPaiId, ativo
7. IF uma requisição POST ou PUT for recebida sem os campos obrigatórios (codigo, nome) ou com valores excedendo os limites de caracteres, THEN THE Centro_Custos SHALL retornar erro 400 com mensagem indicando os campos inválidos
8. IF uma requisição POST for recebida com um codigo que já existe em outro centro de custo, THEN THE Centro_Custos SHALL retornar erro 409 com mensagem indicando duplicidade de código
9. IF uma requisição POST ou PUT informar um centroPaiId que não corresponde a um centro de custo existente, THEN THE Centro_Custos SHALL retornar erro 400 com mensagem indicando que o centro pai não foi encontrado

### Requisito 4: Submódulo Categorias Financeiras

**User Story:** Como usuário do sistema financeiro, eu quero gerenciar categorias financeiras vinculadas ao plano de contas, para que eu possa classificar transações de forma organizada.

#### Critérios de Aceitação

1. WHEN uma requisição POST é recebida em `/financial-categories` com nome (obrigatório, máximo 100 caracteres), descrição (opcional), tipo (obrigatório, máximo 20 caracteres) e plano_conta_id (opcional, UUID válido), THE Categorias_Financeiras SHALL criar uma nova categoria com o campo ativo definido como true por padrão e retornar os dados da categoria criada incluindo o id gerado
2. IF uma requisição POST ou PUT é recebida com campos obrigatórios ausentes ou com nome excedendo 100 caracteres ou tipo excedendo 20 caracteres, THEN THE Categorias_Financeiras SHALL rejeitar a requisição com erro 400 e mensagem indicando os campos inválidos
3. IF uma requisição POST ou PUT é recebida com plano_conta_id que não corresponde a um plano de contas existente, THEN THE Categorias_Financeiras SHALL rejeitar a requisição com erro 422 e mensagem indicando que o plano de contas informado não existe
4. WHEN uma requisição GET é recebida em `/financial-categories/:id`, THE Categorias_Financeiras SHALL retornar os dados completos da categoria financeira incluindo id, nome, descricao, tipo, planoContaId, ativo, createdAt e updatedAt
5. WHEN uma requisição GET é recebida em `/financial-categories` com parâmetros opcionais page (padrão 1, mínimo 1) e limit (padrão 10, mínimo 1, máximo 100), THE Categorias_Financeiras SHALL retornar a lista paginada de categorias financeiras com metadados de paginação contendo page, limit, totalItems e totalPages
6. WHEN uma requisição PUT é recebida em `/financial-categories/:id` com dados válidos, THE Categorias_Financeiras SHALL atualizar apenas os campos informados (nome, descricao, tipo, planoContaId, ativo) da categoria financeira e retornar os dados atualizados
7. IF uma categoria financeira com o id informado não existir, THEN THE Categorias_Financeiras SHALL retornar erro 404 com mensagem indicando que a categoria não foi encontrada
8. THE Categorias_Financeiras SHALL definir a entidade FinancialCategory com os campos: id (UUID), nome (string, máximo 100), descricao (string, opcional), tipo (string, máximo 20), planoContaId (UUID, opcional), ativo (boolean), createdAt (timestamp) e updatedAt (timestamp)

### Requisito 5: Submódulo Contas a Pagar

**User Story:** Como usuário do sistema financeiro, eu quero gerenciar contas a pagar, para que eu possa controlar obrigações financeiras com fornecedores e prestadores.

#### Critérios de Aceitação

1. WHEN uma requisição POST é recebida em `/accounts-payable` com pessoa_id, numero_documento (máximo 50 caracteres), descricao (máximo 255 caracteres), categoria_financeira_id, centro_custo_id opcional, data_emissao, data_vencimento, valor (entre 0.01 e 999999999.99), conta_bancaria_id opcional e forma_pagamento opcional, THE Contas_Pagar SHALL criar uma nova conta a pagar e retornar os dados da conta criada incluindo o id gerado
2. WHEN uma requisição GET é recebida em `/accounts-payable/:id`, THE Contas_Pagar SHALL retornar os dados completos da conta a pagar contendo id, pessoaId, numeroDocumento, descricao, categoriaFinanceiraId, centroCustoId, contaBancariaId, dataEmissao, dataVencimento, valor, valorPago, status e formaPagamento
3. WHEN uma requisição GET é recebida em `/accounts-payable` com parâmetros page (padrão 1) e limit (padrão 10), THE Contas_Pagar SHALL retornar a lista paginada de contas a pagar com metadados de paginação (total, page, limit, totalPages)
4. WHEN uma requisição PUT é recebida em `/accounts-payable/:id`, THE Contas_Pagar SHALL atualizar os campos informados (numero_documento, descricao, categoria_financeira_id, centro_custo_id, conta_bancaria_id, data_emissao, data_vencimento, valor, forma_pagamento) utilizando COALESCE para preservar valores existentes em campos não informados
5. IF uma conta a pagar com o id informado não existir, THEN THE Contas_Pagar SHALL retornar erro 404 com mensagem descritiva
6. THE Contas_Pagar SHALL definir a entidade AccountPayable com os campos: id, pessoaId, numeroDocumento, descricao, categoriaFinanceiraId, centroCustoId, contaBancariaId, dataEmissao, dataVencimento, valor, valorPago, status, formaPagamento
7. THE Contas_Pagar SHALL inicializar o campo status como 'PENDENTE' e valor_pago como 0 ao criar uma nova conta
8. IF a data_vencimento informada for anterior à data_emissao, THEN THE Contas_Pagar SHALL rejeitar a requisição com erro indicando que a data de vencimento deve ser igual ou posterior à data de emissão
9. IF campos obrigatórios (pessoa_id, numero_documento, descricao, categoria_financeira_id, data_emissao, data_vencimento, valor) não forem informados ou valor for menor ou igual a zero, THEN THE Contas_Pagar SHALL rejeitar a requisição com erro indicando os campos inválidos

### Requisito 6: Submódulo Contas a Receber

**User Story:** Como usuário do sistema financeiro, eu quero gerenciar contas a receber, para que eu possa controlar créditos de clientes e receitas previstas.

#### Critérios de Aceitação

1. WHEN uma requisição POST é recebida em `/accounts-receivable` com pessoa_id, numero_documento (máximo 50 caracteres), descricao (máximo 255 caracteres), categoria_financeira_id, centro_custo_id opcional, data_emissao, data_vencimento, valor (entre 0.01 e 999999999.99), conta_bancaria_id opcional e forma_pagamento opcional, THE Contas_Receber SHALL criar uma nova conta a receber e retornar os dados da conta criada incluindo o id gerado
2. WHEN uma requisição GET é recebida em `/accounts-receivable/:id`, THE Contas_Receber SHALL retornar os dados completos da conta a receber contendo id, pessoaId, numeroDocumento, descricao, categoriaFinanceiraId, centroCustoId, contaBancariaId, dataEmissao, dataVencimento, valor, valorRecebido, status e formaPagamento
3. WHEN uma requisição GET é recebida em `/accounts-receivable` com parâmetros page (padrão 1) e limit (padrão 10), THE Contas_Receber SHALL retornar a lista paginada de contas a receber com metadados de paginação (total, page, limit, totalPages)
4. WHEN uma requisição PUT é recebida em `/accounts-receivable/:id`, THE Contas_Receber SHALL atualizar os campos informados utilizando COALESCE para preservar valores existentes em campos não informados
5. IF uma conta a receber com o id informado não existir, THEN THE Contas_Receber SHALL retornar erro 404 com mensagem descritiva
6. THE Contas_Receber SHALL definir a entidade AccountReceivable com os campos: id, pessoaId, numeroDocumento, descricao, categoriaFinanceiraId, centroCustoId, contaBancariaId, dataEmissao, dataVencimento, valor, valorRecebido, status, formaPagamento
7. THE Contas_Receber SHALL inicializar o campo status como 'PENDENTE' e valor_recebido como 0 ao criar uma nova conta
8. IF a data_vencimento informada for anterior à data_emissao, THEN THE Contas_Receber SHALL rejeitar a requisição com erro indicando que a data de vencimento deve ser igual ou posterior à data de emissão
9. IF campos obrigatórios (pessoa_id, numero_documento, descricao, categoria_financeira_id, data_emissao, data_vencimento, valor) não forem informados ou valor for menor ou igual a zero, THEN THE Contas_Receber SHALL rejeitar a requisição com erro indicando os campos inválidos

### Requisito 7: Submódulo Parcelas

**User Story:** Como usuário do sistema financeiro, eu quero parcelar contas a pagar e a receber, para que eu possa gerenciar pagamentos e recebimentos em múltiplas datas.

#### Critérios de Aceitação

1. WHEN uma requisição POST é recebida em `/installments` com origem (PAGAR ou RECEBER), origem_id (UUID válido referenciando conta existente), numero_parcela (inteiro >= 1), total_parcelas (inteiro >= 1), data_vencimento e valor (entre 0.01 e 999999999.99), THE Parcelas SHALL criar uma parcela vinculada à conta e retornar os dados criados incluindo o id gerado
2. WHEN uma requisição GET é recebida em `/installments/:id`, THE Parcelas SHALL retornar os dados completos da parcela incluindo id, origem, origemId, numeroParcela, totalParcelas, dataVencimento, valor e status
3. WHEN uma requisição GET é recebida em `/installments?origemId=:id`, THE Parcelas SHALL retornar todas as parcelas vinculadas à conta específica ordenadas por numero_parcela
4. THE Parcelas SHALL inicializar o campo status como 'PENDENTE' ao criar uma nova parcela
5. THE Parcelas SHALL definir a entidade Installment com os campos: id (UUID), origem (PAGAR|RECEBER), origemId (UUID), numeroParcela (integer), totalParcelas (integer), dataVencimento (date), valor (numeric 15,2), status (string)
6. IF o origem_id informado não corresponder a uma conta existente do tipo especificado em origem, THEN THE Parcelas SHALL retornar erro 404 com mensagem indicando que a conta de origem não foi encontrada
7. IF numero_parcela for maior que total_parcelas, THEN THE Parcelas SHALL rejeitar a requisição com erro 400 indicando que o número da parcela não pode exceder o total de parcelas

### Requisito 8: Submódulo Baixas Financeiras

**User Story:** Como usuário do sistema financeiro, eu quero registrar baixas (pagamentos/recebimentos efetivos), para que eu possa controlar o fluxo real de caixa.

#### Critérios de Aceitação

1. WHEN uma requisição POST é recebida em `/financial-settlements`, THE Baixas_Financeiras SHALL registrar uma baixa com tipo_conta (RECEBER/PAGAR), conta_id, valor (maior que zero e com até duas casas decimais), data_pagamento, forma_pagamento, conta_bancaria_id opcional, caixa_id opcional e observacao opcional (máximo 500 caracteres)
2. WHEN uma baixa é registrada com tipo_conta PAGAR, THE Baixas_Financeiras SHALL incrementar o campo valor_pago da conta a pagar correspondente (identificada por conta_id) dentro de uma transação, e IF o valor_pago acumulado igualar ou superar o valor total da conta, THEN THE Baixas_Financeiras SHALL atualizar o status da conta para 'PAGO'
3. WHEN uma baixa é registrada com tipo_conta RECEBER, THE Baixas_Financeiras SHALL incrementar o campo valor_recebido da conta a receber correspondente (identificada por conta_id) dentro de uma transação, e IF o valor_recebido acumulado igualar ou superar o valor total da conta, THEN THE Baixas_Financeiras SHALL atualizar o status da conta para 'RECEBIDO'
4. WHEN uma baixa é registrada, THE Baixas_Financeiras SHALL criar um lançamento financeiro associado dentro da mesma transação, informando tipo (DEBITO para PAGAR, CREDITO para RECEBER), origem 'BAIXA', origem_id como o id da baixa, data_lancamento como a data_pagamento e valor da baixa
5. IF o conta_id informado não corresponder a uma conta existente do tipo_conta especificado, THEN THE Baixas_Financeiras SHALL retornar erro 404 com mensagem indicando que a conta não foi encontrada
6. IF o valor da baixa somado ao valor já pago/recebido da conta ultrapassar o valor total da conta, THEN THE Baixas_Financeiras SHALL retornar erro de validação indicando que o valor excede o saldo restante da conta
7. WHEN uma requisição GET é recebida em `/financial-settlements/:id`, THE Baixas_Financeiras SHALL retornar os dados completos da baixa financeira
8. WHEN uma requisição GET é recebida em `/financial-settlements?contaId=:id`, THE Baixas_Financeiras SHALL retornar todas as baixas vinculadas a uma conta específica
9. THE Baixas_Financeiras SHALL definir a entidade FinancialSettlement com os campos: id, tipoConta, contaId, valor, dataPagamento, formaPagamento, contaBancariaId, caixaId, lancamentoFinanceiroId, observacao

### Requisito 9: Submódulo Lançamentos Financeiros

**User Story:** Como usuário do sistema financeiro, eu quero registrar e consultar lançamentos financeiros, para que eu possa ter rastreabilidade de todas as movimentações.

#### Critérios de Aceitação

1. WHEN uma requisição POST é recebida em `/financial-entries` com dados válidos, THE Lancamentos_Financeiros SHALL criar um lançamento com tipo (RECEITA ou DESPESA), origem (máximo 50 caracteres), origem_id, plano_conta_id, centro_custo_id opcional, conta_bancaria_id opcional, caixa_id opcional, data_lancamento, descricao (máximo 255 caracteres) e valor (numeric 15,2 entre 0.01 e 9999999999999.99) e retornar os dados criados
2. IF a requisição POST em `/financial-entries` não contém um ou mais campos obrigatórios (tipo, origem, origem_id, plano_conta_id, data_lancamento, descricao, valor) ou contém valores inválidos, THEN THE Lancamentos_Financeiros SHALL rejeitar a requisição com status 400 e mensagem indicando os campos inválidos
3. WHEN uma requisição GET é recebida em `/financial-entries/:id` com um ID existente, THE Lancamentos_Financeiros SHALL retornar os dados completos do lançamento financeiro incluindo tipo, origem, origemId, planoContaId, centroCustoId, contaBancariaId, caixaId, dataLancamento, descricao, valor, saldoAnterior e saldoPosterior
4. IF uma requisição GET é recebida em `/financial-entries/:id` com um ID inexistente, THEN THE Lancamentos_Financeiros SHALL retornar status 404 com mensagem de erro indicando que o lançamento não foi encontrado
5. WHEN uma requisição GET é recebida em `/financial-entries` com parâmetros de paginação (page, limit), THE Lancamentos_Financeiros SHALL retornar a lista de lançamentos correspondente à página solicitada com metadados de paginação (total de registros, página atual, total de páginas)
6. WHEN nenhum parâmetro de paginação é informado na requisição GET em `/financial-entries`, THE Lancamentos_Financeiros SHALL utilizar valores padrão (page=1, limit=10)
7. IF o lançamento criado possui conta_bancaria_id ou caixa_id informado, THEN THE Lancamentos_Financeiros SHALL registrar saldo_anterior (saldo atual da conta ou caixa antes do lançamento) e calcular saldo_posterior (saldo_anterior somado ou subtraído do valor conforme o tipo)
8. THE Lancamentos_Financeiros SHALL definir a entidade FinancialEntry com os campos: id (UUID), tipo (RECEITA|DESPESA), origem (string), origemId (UUID), planoContaId (UUID), centroCustoId (UUID, opcional), contaBancariaId (UUID, opcional), caixaId (UUID, opcional), dataLancamento (timestamp), descricao (string), valor (numeric 15,2), saldoAnterior (numeric 15,2, opcional), saldoPosterior (numeric 15,2, opcional)

### Requisito 10: Submódulo Formas de Pagamento

**User Story:** Como usuário do sistema financeiro, eu quero gerenciar formas de pagamento, para que eu possa categorizar como os pagamentos e recebimentos são realizados.

#### Critérios de Aceitação

1. WHEN uma requisição POST é recebida em `/payment-methods` com campo nome (1 a 100 caracteres) e descrição opcional (máximo 500 caracteres), THE Sistema_Financeiro SHALL criar uma nova forma de pagamento e retornar os dados criados incluindo o id gerado
2. WHEN uma requisição GET é recebida em `/payment-methods/:id`, THE Sistema_Financeiro SHALL retornar os dados da forma de pagamento contendo id, nome, descricao e ativo
3. WHEN uma requisição GET é recebida em `/payment-methods`, THE Sistema_Financeiro SHALL retornar a lista paginada de formas de pagamento com metadados de paginação (total, page, limit, totalPages), utilizando page padrão 1 e limit padrão 10
4. WHEN uma requisição PUT é recebida em `/payment-methods/:id`, THE Sistema_Financeiro SHALL atualizar os dados da forma de pagamento utilizando COALESCE para preservar valores existentes quando campos não são informados
5. IF uma forma de pagamento com o id informado não existir, THEN THE Sistema_Financeiro SHALL retornar erro 404 com mensagem indicando que o recurso não foi encontrado
6. IF uma requisição POST é recebida em `/payment-methods` sem o campo nome ou com nome vazio, THEN THE Sistema_Financeiro SHALL retornar erro 400 com mensagem indicando que o campo nome é obrigatório
7. THE Sistema_Financeiro SHALL definir a entidade PaymentMethod com os campos: id, nome, descricao, ativo

### Requisito 11: DTOs e Validação de Dados

**User Story:** Como desenvolvedor, eu quero que cada submódulo financeiro possua DTOs tipados para criação, atualização e consulta paginada, para que a transferência de dados entre camadas seja segura e documentada.

#### Critérios de Aceitação

1. THE Sistema_Financeiro SHALL definir um CreateDTO como classe TypeScript para cada submódulo financeiro, contendo como propriedades obrigatórias (sem operador `?`) os campos de criação definidos nas entidades dos Requisitos 2 a 10, excluindo campos gerados pelo sistema (id, status inicial, valores calculados)
2. THE Sistema_Financeiro SHALL definir um UpdateDTO como classe TypeScript para cada submódulo financeiro, contendo todas as propriedades do CreateDTO correspondente marcadas como opcionais (com operador `?`) para permitir atualização parcial
3. THE Sistema_Financeiro SHALL definir um PaginationQueryDTO como classe TypeScript na pasta `application/dto/` de cada submódulo financeiro, com campo page do tipo number (opcional, padrão 1, mínimo 1) e campo limit do tipo number (opcional, padrão 10, mínimo 1, máximo 100)
4. THE Sistema_Financeiro SHALL implementar DTOs como classes TypeScript simples (sem decorators de validação), com tipagem explícita em todas as propriedades, seguindo o padrão estabelecido nos módulos cliente e funcionário
5. IF o valor de page informado no PaginationQueryDTO for menor que 1 ou o valor de limit for menor que 1 ou maior que 100, THEN THE Sistema_Financeiro SHALL utilizar o valor padrão correspondente (page=1, limit=10)

### Requisito 12: Repositórios com Implementação pg-promise

**User Story:** Como desenvolvedor, eu quero que os repositórios financeiros utilizem pg-promise com queries SQL parametrizadas, para que o acesso a dados seja seguro e performático.

#### Critérios de Aceitação

1. THE Sistema_Financeiro SHALL implementar cada repositório injetando 'DATABASE_CONNECTION' via construtor e utilizando `this.connection()` para obter a instância de conexão ao executar queries
2. THE Sistema_Financeiro SHALL utilizar queries parametrizadas ($1, $2, ...) em todas as operações SQL, sem concatenação de valores diretamente nas strings de query
3. THE Sistema_Financeiro SHALL aceitar um parâmetro opcional `transaction` em métodos de escrita (create, update, delete) e utilizar a transação recebida quando fornecida, ou `this.connection()` quando o parâmetro for nulo ou não informado
4. THE Sistema_Financeiro SHALL utilizar `db.one()` para operações INSERT e UPDATE com RETURNING que retornam exatamente um registro, `db.oneOrNone()` para buscas por id que podem não encontrar resultado, e `db.any()` para listagens que retornam zero ou mais registros
5. THE Sistema_Financeiro SHALL implementar paginação com LIMIT/OFFSET calculando offset como (page - 1) * limit, utilizando valores padrão de page=1 e limit=10 quando não informados, com limite máximo de 100 registros por página, e retornar contagem total via query COUNT separada no formato `{ data: registros[], total: number }`
6. THE Sistema_Financeiro SHALL utilizar COALESCE em queries de UPDATE para cada campo atualizável, de forma que valores null passados como parâmetro preservem o valor existente na coluna
7. IF uma operação com `db.one()` não encontrar registro correspondente, THEN THE Sistema_Financeiro SHALL propagar o erro QueryResultError do pg-promise sem interceptá-lo no repositório, permitindo que a camada de aplicação trate a exceção

### Requisito 13: Módulo NestJS e Injeção de Dependência

**User Story:** Como desenvolvedor, eu quero que cada submódulo financeiro seja registrado como um módulo NestJS independente com injeção de dependência adequada, para que os módulos sejam desacoplados e testáveis.

#### Critérios de Aceitação

1. THE Sistema_Financeiro SHALL registrar cada submódulo como um @Module NestJS com controllers, providers e imports
2. THE Sistema_Financeiro SHALL registrar interfaces de repositório como providers usando o padrão `{ provide: 'INomeRepository', useClass: NomeRepository }`
3. THE Sistema_Financeiro SHALL registrar cada use-case como provider direto no array de providers do módulo
4. THE Sistema_Financeiro SHALL injetar dependências nos use-cases via construtor utilizando o decorator @Inject com tokens string
5. THE Sistema_Financeiro SHALL importar o DatabaseModule (pg-promise) em cada submódulo financeiro para disponibilizar o token 'DATABASE_CONNECTION'
6. THE Sistema_Financeiro SHALL exportar os use-cases de cada submódulo para permitir uso por outros módulos quando necessário (ex: Baixas_Financeiras utiliza use-cases de Lancamentos_Financeiros)
