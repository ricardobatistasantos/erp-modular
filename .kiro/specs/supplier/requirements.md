# Requirements Document

## Introduction

Módulo de Fornecedor (Supplier) para o sistema ERP modular. Este módulo segue o padrão de pessoa (person) já estabelecido pelos módulos de Cliente e Colaborador, implementando operações CRUD completas com arquitetura limpa (Clean Architecture) em camadas: domain, application, infra e presentation. O fornecedor é uma extensão da entidade Pessoa, com campos específicos de categoria e prazo de entrega.

## Glossary

- **Sistema**: O módulo de Fornecedor do ERP modular NestJS
- **Fornecedor**: Entidade que representa um fornecedor no sistema, vinculada a uma Pessoa
- **Pessoa**: Entidade base compartilhada que contém dados comuns (nome, email, tipo, contatos, endereços)
- **Repositório**: Interface de acesso a dados que abstrai a persistência (pg-promise/PostgreSQL)
- **Transação**: Operação atômica no banco de dados que garante consistência entre criação de Pessoa e Fornecedor
- **DTO**: Data Transfer Object — objeto de validação e transferência de dados entre camadas
- **Soft_Delete**: Exclusão lógica via campo "ativo" na tabela pessoa (não remove fisicamente o registro)
- **Paginação**: Mecanismo de consulta com parâmetros page e limit para listagem de registros
- **Categoria**: Campo de texto que classifica o tipo/segmento do fornecedor
- **PrazoEntregaDias**: Campo numérico que indica o prazo de entrega padrão do fornecedor em dias

## Requirements

### Requirement 1: Criar Fornecedor

**User Story:** As a usuário do ERP, I want to criar um fornecedor com dados de pessoa e dados específicos de fornecedor, so that eu possa registrar fornecedores no sistema de forma completa e transacional.

#### Acceptance Criteria

1. WHEN uma requisição POST com dados válidos de pessoa e fornecedor é recebida, THE Sistema SHALL criar o registro de Pessoa (com o flag fornecedor ativado) e o registro de Fornecedor dentro de uma única transação no banco de dados, e retornar os dados da pessoa criada incluindo o id gerado
2. WHEN o tipo de pessoa é "F" (Física) e dados de pessoa física são fornecidos, THE Sistema SHALL criar o registro de pessoa_fisica associado à pessoa dentro da mesma transação
3. WHEN o tipo de pessoa é "J" (Jurídica) e dados de pessoa jurídica são fornecidos, THE Sistema SHALL criar o registro de pessoa_juridica associado à pessoa dentro da mesma transação
4. WHEN contatos são fornecidos no payload, THE Sistema SHALL criar todos os registros de contato associados à pessoa dentro da mesma transação
5. WHEN endereços são fornecidos no payload, THE Sistema SHALL criar todos os registros de endereço associados à pessoa dentro da mesma transação
6. IF ocorrer um erro durante a transação, THEN THE Sistema SHALL reverter todas as operações realizadas na transação (rollback) e retornar uma resposta de erro ao cliente sem persistir nenhum registro parcial
7. THE Sistema SHALL validar os campos do DTO de criação utilizando class-validator antes de executar a operação, rejeitando a requisição com as mensagens de validação correspondentes caso algum campo seja inválido
8. IF o tipo de pessoa for "F" e os dados de pessoa física não forem fornecidos, THEN THE Sistema SHALL criar apenas o registro de pessoa e fornecedor sem registro de pessoa_fisica
9. IF o tipo de pessoa for "J" e os dados de pessoa jurídica não forem fornecidos, THEN THE Sistema SHALL criar apenas o registro de pessoa e fornecedor sem registro de pessoa_juridica

### Requirement 2: Buscar Fornecedor por ID

**User Story:** As a usuário do ERP, I want to buscar um fornecedor pelo seu ID, so that eu possa visualizar os dados completos de um fornecedor específico.

#### Acceptance Criteria

1. WHEN uma requisição GET é recebida com um ID válido (formato UUID) de um fornecedor cuja pessoa associada possua o campo ativo igual a true, THE Sistema SHALL retornar os dados do fornecedor contendo: id, pessoa_id, categoria, prazo_entrega_dias, nome, email e tipo da pessoa associada
2. IF o ID informado não corresponde a nenhum fornecedor existente ou a pessoa associada ao fornecedor possui o campo ativo igual a false, THEN THE Sistema SHALL retornar um erro indicando que o fornecedor não foi encontrado com código HTTP 404
3. IF o ID informado não está no formato UUID válido, THEN THE Sistema SHALL retornar um erro de validação indicando que o formato do ID é inválido
4. WHILE realizando a consulta de fornecedor, THE Sistema SHALL consultar apenas fornecedores cuja pessoa associada possua o campo ativo igual a true por meio de JOIN entre as tabelas fornecedor e pessoa

### Requirement 3: Listar Fornecedores com Paginação

**User Story:** As a usuário do ERP, I want to listar todos os fornecedores com paginação, so that eu possa navegar pelos registros de forma eficiente.

#### Acceptance Criteria

1. WHEN uma requisição GET sem parâmetros é recebida, THE Sistema SHALL retornar a primeira página com page igual a 1 e limit igual a 10
2. WHEN parâmetros de paginação (page, limit) são fornecidos, THE Sistema SHALL retornar os registros correspondentes à página e limite solicitados, calculando o offset como (page - 1) * limit
3. THE Sistema SHALL retornar os dados no formato { data: array de fornecedores, meta: { total: contagem total de registros ativos, page: página atual, limit: limite atual, totalPages: Math.ceil(total / limit) } }
4. THE Sistema SHALL ordenar os resultados pelo nome da pessoa associada em ordem ascendente (ASC)
5. THE Sistema SHALL listar apenas fornecedores cuja pessoa associada possua o campo ativo igual a true
6. IF o parâmetro page não é um inteiro maior ou igual a 1 ou o parâmetro limit não é um inteiro entre 1 e 100, THEN THE Sistema SHALL rejeitar a requisição retornando uma mensagem de erro indicando o campo inválido e a restrição violada
7. WHEN a consulta não encontra nenhum fornecedor ativo, THE Sistema SHALL retornar data como um array vazio e meta com total igual a 0 e totalPages igual a 0

### Requirement 4: Atualizar Fornecedor

**User Story:** As a usuário do ERP, I want to atualizar os dados de um fornecedor existente, so that eu possa manter as informações do fornecedor atualizadas.

#### Acceptance Criteria

1. WHEN uma requisição PUT com ID e dados de atualização válidos é recebida, THE Sistema SHALL atualizar apenas os campos fornecidos no payload, preservando os valores existentes para campos não incluídos na requisição
2. WHEN dados de pessoa são incluídos na atualização, THE Sistema SHALL atualizar os campos da pessoa associada (nome, email, observacao, tipo, fisica/juridica) e, caso contatos ou enderecos sejam fornecidos, remover todos os registros existentes e recriá-los com os novos dados fornecidos
3. THE Sistema SHALL validar os campos do DTO de atualização utilizando class-validator antes de executar a operação
4. IF a validação do DTO falhar, THEN THE Sistema SHALL rejeitar a requisição com status 400 e retornar mensagem indicando os campos inválidos
5. IF o fornecedor com o ID informado não existir, THEN THE Sistema SHALL rejeitar a requisição com status 404 e retornar mensagem indicando que o fornecedor não foi encontrado
6. THE Sistema SHALL executar todas as operações de atualização (pessoa, fornecedor, contatos, endereços) dentro de uma única transação, revertendo todas as alterações caso qualquer etapa falhe
7. WHEN a atualização for concluída com sucesso, THE Sistema SHALL retornar o registro completo do fornecedor atualizado incluindo os dados de pessoa, contatos e endereços

### Requirement 5: Excluir Fornecedor (Soft Delete)

**User Story:** As a usuário do ERP, I want to excluir logicamente um fornecedor, so that o registro seja desativado sem perda de dados históricos.

#### Acceptance Criteria

1. WHEN uma requisição DELETE /supplier/:id é recebida com um ID que corresponde a um fornecedor existente, THE Sistema SHALL definir o campo ativo da pessoa associada ao fornecedor como false e retornar status HTTP 204 sem corpo de resposta
2. THE Sistema SHALL preservar todos os dados do fornecedor e da pessoa no banco de dados após a exclusão lógica, sem realizar exclusão física de nenhum registro
3. IF o ID informado na requisição DELETE não corresponder a nenhum fornecedor cadastrado, THEN THE Sistema SHALL retornar status HTTP 404 com uma mensagem de erro indicando que o fornecedor não foi encontrado
4. IF o ID informado na requisição DELETE não estiver em formato UUID válido, THEN THE Sistema SHALL retornar status HTTP 400 com uma mensagem de erro indicando que o formato do ID é inválido

### Requirement 6: Validação de DTOs

**User Story:** As a desenvolvedor, I want to ter DTOs com validações robustas via class-validator, so that dados inválidos sejam rejeitados antes de chegar à camada de aplicação.

#### Acceptance Criteria

1. WHEN o campo categoria é fornecido no SupplierDataDTO, THE Sistema SHALL validar que o valor é uma string com no máximo 100 caracteres
2. WHEN o campo prazoEntregaDias é fornecido no SupplierDataDTO, THE Sistema SHALL validar que o valor é um número inteiro no intervalo de 0 a 365
3. WHEN uma requisição de criação de fornecedor é recebida, THE Sistema SHALL validar que o objeto pessoa segue o CreatePersonDTO compartilhado com nome obrigatório (string não vazia), email opcional (formato de email válido quando fornecido), e tipo obrigatório com valor "F" ou "J"
4. WHEN uma requisição de criação de fornecedor é recebida, THE Sistema SHALL validar os objetos aninhados pessoa e fornecedor propagando as validações de cada DTO interno via @ValidateNested
5. IF qualquer campo do DTO falhar na validação, THEN THE Sistema SHALL retornar uma resposta HTTP 400 (Bad Request) contendo um array de mensagens de erro em português brasileiro, com uma mensagem específica por campo inválido
6. WHEN uma requisição de atualização de fornecedor é recebida, THE Sistema SHALL tratar os campos pessoa e fornecedor como opcionais, aplicando as mesmas regras de validação dos sub-campos apenas quando o objeto pai é fornecido

### Requirement 7: Registro do Módulo

**User Story:** As a desenvolvedor, I want to ter o módulo de fornecedor registrado corretamente no NestJS, so that todas as dependências sejam injetadas e o módulo funcione integrado ao sistema.

#### Acceptance Criteria

1. THE Sistema SHALL registrar o SupplierController no array `controllers` do decorator @Module do SupplierModule
2. THE Sistema SHALL registrar os cinco use cases (CreateSupplierUseCase, GetByIdSupplierUseCase, FindAllSuppliersUseCase, UpdateSupplierUseCase, DeleteSupplierUseCase) como classes diretas no array `providers` do módulo
3. THE Sistema SHALL registrar o SupplierRepository utilizando o padrão `{ provide: 'ISupplierRepository', useClass: SupplierRepository }` no array `providers` do módulo
4. THE Sistema SHALL registrar os repositórios compartilhados de pessoa (IPersonRepository, IPersonFisicaRepository, IPersonJuridicaRepository, IContactRepository, IAddressRepository) utilizando o padrão `{ provide: '<token>', useClass: <RepositoryClass> }` no array `providers` do módulo, seguindo o mesmo padrão do ClientModule
5. WHEN o NestJS inicializar o SupplierModule, THE Sistema SHALL resolver todas as dependências injetadas no SupplierController e nos use cases sem erros de injeção de dependência

### Requirement 8: Interface do Repositório

**User Story:** As a desenvolvedor, I want to ter uma interface de repositório bem definida para o fornecedor, so that a implementação de persistência possa ser substituída sem afetar as camadas superiores.

#### Acceptance Criteria

1. THE Sistema SHALL definir a interface ISupplierRepository com os métodos: create(data, transaction?) → Promise<Supplier>, findById(id) → Promise<any|null>, findAll(page, limit) → Promise<{data: any[], total: number}>, update(id, data, transaction?) → Promise<any>, delete(id) → Promise<void>
2. THE Sistema SHALL implementar a interface ISupplierRepository utilizando pg-promise com queries SQL contra a tabela "fornecedor", injetando DATABASE_CONNECTION via @Inject
3. WHEN o método findById é chamado, THE Sistema SHALL realizar INNER JOIN entre as tabelas fornecedor e pessoa, retornando id, pessoa_id, categoria, prazo_entrega_dias, nome, email e tipo, filtrando por ativo = true
4. WHEN o método findAll é chamado, THE Sistema SHALL realizar INNER JOIN entre as tabelas fornecedor e pessoa, aplicar filtro de pessoa ativa (ativo = true), ordenar por nome ASC, e aplicar LIMIT/OFFSET para paginação
5. WHEN o método delete é chamado, THE Sistema SHALL executar UPDATE na tabela pessoa definindo ativo como false para a pessoa associada ao fornecedor (soft delete via pessoa)
