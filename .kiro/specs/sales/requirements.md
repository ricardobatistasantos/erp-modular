# Sales Module — Requirements

## Overview

O módulo de vendas gerencia pedidos de venda, vinculando clientes, vendedores, produtos e formas de pagamento. É o ponto de integração entre os módulos de pessoas, produtos, estoque e financeiro.

## Requirements

### Requirement 1: Criação de Pedido de Venda

**User Story:** Como vendedor, quero criar um pedido de venda para um cliente, para registrar a intenção de compra.

#### Acceptance Criteria

1. O pedido deve referenciar um cliente existente
2. O pedido deve referenciar um vendedor existente (opcional)
3. Deve conter ao menos um item com produto, quantidade e valor unitário
4. Deve calcular o valor total automaticamente
5. Status inicial: ABERTO

### Requirement 2: Faturamento de Pedido

**User Story:** Como faturista, quero faturar um pedido aprovado, para gerar a cobrança e baixar o estoque.

#### Acceptance Criteria

1. Ao faturar, deve gerar uma `conta_receber` no módulo financeiro
2. Deve gerar movimentos de saída no estoque para cada item
3. Status do pedido muda para FATURADO
4. Deve liberar reservas de estoque associadas

## Status

O módulo `sales` existe na estrutura mas ainda não tem domain, repositórios ou use cases implementados. Apenas controller stub e use cases stub existem.

## Database Tables (a definir)

```sql
-- Tabelas de vendas ainda não definidas no schema atual
-- Sugestão:
pedidos_venda (id UUID PK, cliente_id FK, vendedor_id FK?, status, data_pedido, valor_total, created_at, updated_at)
pedido_itens  (id UUID PK, pedido_id FK, produto_id FK, quantidade, valor_unitario, valor_total)
```
