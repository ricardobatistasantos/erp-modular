# Client Module — Requirements

## Overview

O módulo `client` gerencia o cadastro de clientes. Um cliente é sempre uma `Pessoa` com dados comerciais adicionais (taxa de desconto e limite de crédito).

## Glossary

| Termo | Definição |
|---|---|
| Cliente | Pessoa com relacionamento comercial de compra com a empresa |
| Taxa de Desconto | Percentual de desconto padrão aplicado nas vendas para o cliente |
| Limite de Crédito | Valor máximo de crédito disponível para o cliente |

## Requirements

### Requirement 1: Cadastro de Cliente

**User Story:** Como vendedor, quero cadastrar um cliente com seus dados pessoais e comerciais, para que ele possa realizar compras.

#### Acceptance Criteria

1. O sistema deve criar uma `Pessoa` base com flag `cliente = 1`
2. Se `tipo = 'F'`, deve criar `pessoa_fisica` com CPF
3. Se `tipo = 'J'`, deve criar `pessoa_juridica` com CNPJ
4. Deve criar registros de contatos e endereços se informados
5. Deve criar o registro em `cliente` com taxa de desconto e limite de crédito
6. Toda a operação deve ser atômica (transação única)

### Requirement 2: Consulta de Cliente por ID

**User Story:** Como usuário, quero consultar os dados de um cliente pelo ID.

#### Acceptance Criteria

1. O endpoint `GET /client/:id` deve retornar os dados do cliente
2. Deve retornar 404 se não encontrado

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

## Database Tables

```sql
cliente (id UUID PK, pessoa_id FK, taxa_desconto DECIMAL?, limit_credito DECIMAL?)
```
