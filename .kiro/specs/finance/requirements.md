# Finance Module — Requirements

## Overview

O domínio financeiro do ERP cobre contas a pagar, contas a receber, fluxo de caixa, bancos, contas bancárias e tesouraria. Todos os módulos financeiros evitam soft delete (dados fiscais devem ser preservados).

## Submodules

| Módulo | Responsabilidade |
|---|---|
| `accounts-payable` | Gestão de contas a pagar |
| `accounts-receivable` | Gestão de contas a receber |
| `banks` | Cadastro de bancos e agências |
| `bank-accounts` | Contas bancárias da empresa |
| `cash-flow` | Fluxo de caixa e lançamentos |
| `payment-methods` | Formas de pagamento |
| `treasury` | Tesouraria e baixas financeiras |

## Shared Domain Concepts

### Lançamento Financeiro
Toda movimentação financeira gera um `lancamento_financeiro` com:
- tipo (RECEITA/DESPESA)
- origem e origem_id (rastreabilidade)
- plano_conta_id, centro_custo_id, conta_bancaria_id
- valor, saldo_anterior, saldo_posterior

### Parcelas
Contas podem ser parceladas. Cada parcela tem:
- numero_parcela, total_parcelas
- data_vencimento, valor, status

### Baixas Financeiras
Registro de pagamento/recebimento efetivo com:
- tipo_conta (RECEBER/PAGAR)
- valor, data_pagamento, forma_pagamento
- referência ao lançamento financeiro gerado

## Rules

- Sem soft delete em tabelas financeiras/fiscais
- UUID como PK em todas as tabelas
- `created_at` obrigatório; `updated_at` obrigatório onde há edição
- Toda baixa deve gerar um lançamento financeiro correspondente
- Estornos devem gerar lançamento de estorno e referenciar a baixa original

## Database Tables (Finance)

```sql
plano_contas          (id, codigo, nome, tipo ENUM, natureza ENUM, conta_pai_id?, aceita_lancamento, ativo, createdAt, updatedAt)
centro_custos         (id, codigo, nome, descricao?, centro_pai_id?, ativo, createdAt, updatedAt)
categorias_financeiras(id, nome, descricao?, tipo, plano_conta_id?, ativo, createdAt, updatedAt)
contas_receber        (id, pessoa_id, numero_documento, descricao, categoria_financeira_id, data_emissao, data_vencimento, valor, valor_recebido, status, forma_pagamento?, createdAt, updatedAt)
contas_pagar          (id, pessoa_id, numero_documento, descricao, categoria_financeira_id, data_emissao, data_vencimento, valor, valor_pago, status, forma_pagamento?, createdAt, updatedAt)
lancamentos_financeiros(id, tipo, origem, origem_id, plano_conta_id, centro_custo_id?, conta_bancaria_id?, caixa_id?, data_lancamento, descricao, valor, saldo_anterior?, saldo_posterior?)
parcelas              (id, origem, origem_id, numero_parcela, total_parcelas, data_vencimento, valor, status, createdAt, updatedAt)
baixas_financeiras    (id, tipo_conta ENUM, conta_id, valor, data_pagamento, forma_pagamento, conta_bancaria_id?, caixa_id?, lancamento_financeiro_id, observacao?, createdAt, updatedAt)
estornos_financeiros  (id, baixa_id, valor, motivo, lancamento_estorno_id, createdAt, updatedAt)
historico_contas      (id, tipo_conta ENUM, conta_id, tipo_evento, status_anterior?, status_novo?, valor_anterior?, valor_novo?, descricao, usuario_id?, createdAt, updatedAt)
banco                 (id, codigo, nome, url_site?)
banco_agencia         (id, banco_id FK, numero, digito, nome, contato?, gerente?, observacao?)
banco_conta           (id, banco_agencia_id FK, numero, digito, nome, tipo, descricao?)
```
