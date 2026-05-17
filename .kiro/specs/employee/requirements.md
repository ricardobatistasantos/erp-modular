# Employee Module — Requirements

## Overview

O módulo `employee` gerencia o cadastro de colaboradores da empresa. Um colaborador é sempre uma `Pessoa` (física ou jurídica) com dados adicionais de vínculo empregatício. Opcionalmente, um colaborador pode ter um perfil de vendedor.

## Glossary

| Termo | Definição |
|---|---|
| Colaborador | Pessoa com vínculo empregatício registrado na empresa |
| Matrícula | Identificador único do colaborador dentro da empresa |
| Cargo | Posição hierárquica com nome e salário |
| Departamento | Setor organizacional ao qual o colaborador pertence |
| Vendedor | Perfil opcional de colaborador com comissão e meta de vendas |

## Requirements

### Requirement 1: Cadastro de Colaborador

**User Story:** Como RH, quero cadastrar um colaborador com seus dados pessoais e de vínculo, para que ele esteja registrado no sistema.

#### Acceptance Criteria

1. O sistema deve criar uma `Pessoa` base com nome, email, tipo (F/J) e flag `colaborador = 1`
2. Se `tipo = 'F'`, deve criar `pessoa_fisica` com CPF
3. Se `tipo = 'J'`, deve criar `pessoa_juridica` com CNPJ
4. Deve criar registros em `pessoa_contato` para cada contato informado
5. Deve criar registros em `pessoa_endereco` para cada endereço informado
6. Deve criar o registro em `colaborador` com matrícula, data de admissão e referência à pessoa
7. Toda a operação deve ser atômica (transação única)
8. A matrícula deve ser única no sistema

### Requirement 2: Perfil de Vendedor

**User Story:** Como RH, quero marcar um colaborador como vendedor com comissão e meta, para que o módulo de vendas possa referenciá-lo.

#### Acceptance Criteria

1. O campo `vendedor` no DTO é opcional
2. Se informado, deve criar registro na tabela `vendedor` com `colaborador_id`, `comissao` e `meta_venda`
3. A comissão deve ser um valor decimal (ex: 0.05 = 5%)
4. A meta de vendas deve ser um valor decimal positivo

### Requirement 3: Criação de Usuário de Acesso

**User Story:** Como administrador, quero que ao cadastrar um colaborador seja possível disparar a criação de login, para que ele possa acessar o sistema.

#### Acceptance Criteria

1. O campo `createUser` no DTO é booleano e opcional (default false)
2. Quando `createUser = true`, deve publicar evento na fila (RabbitMQ) com id, personId, nome e email
3. A criação do usuário não deve bloquear o retorno do cadastro do colaborador

### Requirement 4: Consulta de Colaborador por ID

**User Story:** Como usuário do sistema, quero consultar os dados de um colaborador pelo seu ID, para visualizar suas informações.

#### Acceptance Criteria

1. O endpoint `GET /employee/:id` deve retornar os dados do colaborador
2. Deve retornar 404 se o colaborador não for encontrado

## DTOs

### CreateEmployeeDTO
```json
{
  "pessoa": { "...CreatePersonDTO" },
  "colaborador": {
    "matricula": "string",
    "dataAdmissao": "Date?",
    "dataDemissao": "Date?",
    "cargo": { "nome": "string", "salario": "number" },
    "departamento": { "nome": "string" },
    "vendedor": { "comissao": "number", "metaVendas": "number" }
  },
  "createUser": "boolean"
}
```

## Database Tables

```sql
colaborador (id UUID PK, pessoa_id FK, matricula UNIQUE, admissao TIMESTAMP, demissao TIMESTAMP?)
vendedor    (id UUID PK, colaborador_id FK, comissao DECIMAL, meta_venda DECIMAL)
```
