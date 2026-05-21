# Client Module — Requirements

## Introdução

O módulo `client` gerencia o CRUD completo de clientes. Um cliente é sempre uma `Pessoa` com dados comerciais adicionais (taxa de desconto e limite de crédito). O módulo segue Clean Architecture com camadas domain, application, infra e presentation.

## Glossário

| Termo | Definição |
|---|---|
| Cliente | Pessoa com relacionamento comercial de compra com a empresa |
| Pessoa | Entidade base que contém dados pessoais (nome, email, tipo) |
| Taxa_Desconto | Percentual de desconto padrão aplicado nas vendas para o cliente |
| Limite_Credito | Valor máximo de crédito disponível para o cliente |
| Sistema | O módulo client do ERP |
| Paginação | Mecanismo de divisão de resultados em páginas com limit e offset |
| Soft_Delete | Exclusão lógica que desativa o registro sem removê-lo fisicamente |

## Requirements

### Requirement 1: Cadastro de Cliente

**User Story:** Como vendedor, quero cadastrar um cliente com seus dados pessoais e comerciais, para que ele possa realizar compras.

#### Acceptance Criteria

1. WHEN uma requisição POST /client é recebida com dados válidos, THE Sistema SHALL criar uma Pessoa base com flag `cliente = 1` e retornar os dados criados
2. WHEN o tipo da pessoa é 'F', THE Sistema SHALL criar o registro em pessoa_fisica com CPF
3. WHEN o tipo da pessoa é 'J', THE Sistema SHALL criar o registro em pessoa_juridica com CNPJ
4. WHEN contatos são informados no payload, THE Sistema SHALL criar os registros de contato associados à Pessoa
5. WHEN endereços são informados no payload, THE Sistema SHALL criar os registros de endereço associados à Pessoa
6. THE Sistema SHALL criar o registro na tabela cliente com Taxa_Desconto e Limite_Credito associados à Pessoa criada
7. THE Sistema SHALL executar toda a operação de cadastro dentro de uma transação única (atômica)

### Requirement 2: Consulta de Cliente por ID

**User Story:** Como usuário, quero consultar os dados completos de um cliente pelo seu ID, para visualizar suas informações comerciais e pessoais.

#### Acceptance Criteria

1. WHEN uma requisição GET /client/:id é recebida com um ID válido existente, THE Sistema SHALL retornar os dados do Cliente com informações da Pessoa associada
2. WHEN uma requisição GET /client/:id é recebida com um ID inexistente, THE Sistema SHALL retornar status 404 com mensagem de erro

### Requirement 3: Listagem de Clientes

**User Story:** Como usuário, quero listar todos os clientes cadastrados com paginação, para navegar pelos registros de forma eficiente.

#### Acceptance Criteria

1. WHEN uma requisição GET /client é recebida, THE Sistema SHALL retornar uma lista paginada de clientes ativos com dados da Pessoa associada
2. WHEN parâmetros de Paginação (page, limit) são informados, THE Sistema SHALL retornar os registros correspondentes à página solicitada
3. WHEN nenhum parâmetro de Paginação é informado, THE Sistema SHALL utilizar valores padrão (page=1, limit=10)
4. THE Sistema SHALL retornar no response os metadados de Paginação (total de registros, página atual, total de páginas)
5. THE Sistema SHALL ordenar os resultados por nome da Pessoa em ordem alfabética

### Requirement 4: Atualização de Cliente

**User Story:** Como vendedor, quero atualizar os dados comerciais de um cliente, para manter as condições comerciais atualizadas.

#### Acceptance Criteria

1. WHEN uma requisição PUT /client/:id é recebida com dados válidos e ID existente, THE Sistema SHALL atualizar os campos informados do Cliente e retornar os dados atualizados
2. WHEN Taxa_Desconto é informada no payload, THE Sistema SHALL atualizar o campo taxa_desconto do Cliente
3. WHEN Limite_Credito é informado no payload, THE Sistema SHALL atualizar o campo limit_credito do Cliente
4. WHEN uma requisição PUT /client/:id é recebida com um ID inexistente, THE Sistema SHALL retornar status 404 com mensagem de erro
5. THE Sistema SHALL atualizar apenas os campos informados no payload, mantendo os demais inalterados

### Requirement 5: Exclusão de Cliente

**User Story:** Como administrador, quero desativar um cliente, para que ele não apareça mais nas listagens sem perder o histórico.

#### Acceptance Criteria

1. WHEN uma requisição DELETE /client/:id é recebida com um ID existente, THE Sistema SHALL realizar Soft_Delete desativando o registro do Cliente
2. WHEN uma requisição DELETE /client/:id é recebida com um ID inexistente, THE Sistema SHALL retornar status 404 com mensagem de erro
3. WHEN um Cliente é desativado via Soft_Delete, THE Sistema SHALL atualizar o campo `ativo` para false na tabela pessoa
4. WHEN a listagem de clientes é solicitada, THE Sistema SHALL excluir clientes desativados dos resultados

## DTOs

### CreateClientDTO
```json
{
  "pessoa": { "...CreatePersonDTO" },
  "cliente": {
    "taxaDesconto": "number?",
    "limiteCredito": "number?"
  },
  "createUser": "boolean"
}
```

### UpdateClientDTO
```json
{
  "taxaDesconto": "number?",
  "limiteCredito": "number?"
}
```

### PaginationQueryDTO
```json
{
  "page": "number? (default: 1)",
  "limit": "number? (default: 10)"
}
```

## Database Tables

```sql
cliente (id UUID PK, pessoa_id FK, taxa_desconto DECIMAL?, limit_credito DECIMAL?)
pessoa (id UUID PK, nome VARCHAR, email VARCHAR, tipo CHAR(1), cliente INT, ativo BOOLEAN DEFAULT true, ...)
```
