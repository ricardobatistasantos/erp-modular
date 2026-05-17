# Salesperson Module — Requirements

## Overview

O módulo `salesperson` gerencia o cadastro de vendedores. Um vendedor é um `Colaborador` com perfil de vendas (comissão e meta). O módulo é independente do `employee` e referencia um colaborador já existente pelo `colaborador_id`.

## Glossary

| Termo | Definição |
|---|---|
| Vendedor | Colaborador habilitado para realizar vendas com comissão e meta definidas |
| Comissão | Percentual sobre vendas que o vendedor recebe como remuneração variável |
| Meta de Vendas | Valor alvo de vendas que o vendedor deve atingir no período |

## Requirements

### Requirement 1: Cadastro de Vendedor

**User Story:** Como gerente comercial, quero cadastrar um colaborador como vendedor com sua comissão e meta, para que ele possa ser associado a pedidos de venda.

#### Acceptance Criteria

1. O sistema deve criar um registro na tabela `vendedor` com `colaborador_id`, `comissao` e `meta_venda`
2. O `colaborador_id` deve referenciar um colaborador existente na tabela `colaborador`
3. A comissão deve ser um valor decimal entre 0 e 1 (ex: 0.05 = 5%)
4. A meta de vendas deve ser um valor decimal positivo
5. Um colaborador não pode ter mais de um perfil de vendedor ativo

### Requirement 2: Consulta de Vendedor por ID

**User Story:** Como usuário, quero consultar os dados de um vendedor pelo ID, para visualizar sua comissão e meta.

#### Acceptance Criteria

1. O endpoint `GET /salesperson/:id` deve retornar os dados do vendedor
2. Deve retornar 404 se não encontrado

### Requirement 3: Listagem de Vendedores

**User Story:** Como gerente, quero listar todos os vendedores cadastrados.

#### Acceptance Criteria

1. O endpoint `GET /salesperson` deve retornar a lista de vendedores
2. Deve incluir dados básicos do colaborador/pessoa associada

## DTOs

### CreateSalespersonDTO
```json
{
  "colaboradorId": "string (UUID)",
  "comissao": "number (0-1)",
  "metaVendas": "number (positive)"
}
```

### SalespersonDTO
```json
{
  "id": "string",
  "colaboradorId": "string",
  "comissao": "number",
  "metaVendas": "number"
}
```

## Database Table

```sql
vendedor (
  id UUID PK default gen_random_uuid(),
  colaborador_id UUID FK → colaborador(id),
  comissao DECIMAL(18,6) NOT NULL,
  meta_venda DECIMAL(18,6) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NULL
)
```
