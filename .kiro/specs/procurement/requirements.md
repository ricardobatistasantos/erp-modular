# Procurement Module — Requirements

## Overview

O módulo de compras gerencia pedidos de compra junto a fornecedores, recebimento de mercadorias e integração com estoque e financeiro.

## Requirements

### Requirement 1: Criação de Pedido de Compra

**User Story:** Como comprador, quero criar um pedido de compra para um fornecedor, para registrar a aquisição de produtos.

#### Acceptance Criteria

1. O pedido deve referenciar um fornecedor existente
2. Deve conter ao menos um item com produto, quantidade e valor unitário
3. Status inicial: ABERTO

### Requirement 2: Recebimento de Mercadoria

**User Story:** Como estoquista, quero registrar o recebimento de um pedido de compra, para dar entrada no estoque.

#### Acceptance Criteria

1. Ao receber, deve gerar movimentos de entrada no estoque
2. Deve gerar uma `conta_pagar` no módulo financeiro
3. Status do pedido muda para RECEBIDO

## Status

O módulo `procurement` existe na estrutura mas ainda não tem domain, repositórios ou use cases implementados.

## Database Tables (a definir)

```sql
pedidos_compra (id UUID PK, fornecedor_id FK, status, data_pedido, valor_total, created_at, updated_at)
pedido_compra_itens (id UUID PK, pedido_id FK, produto_id FK, quantidade, valor_unitario, valor_total)
```
