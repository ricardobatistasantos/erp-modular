# Inventory Control Module — Requirements

## Overview

O módulo de controle de estoque gerencia toda a movimentação de produtos: entradas, saídas, transferências, reservas, inventários e requisições de almoxarifado.

## Glossary

| Termo | Definição |
|---|---|
| Depósito | Local físico de armazenamento de produtos |
| Endereço de Estoque | Posição específica dentro de um depósito (prateleira, corredor) |
| Lote | Agrupamento de produtos com mesma fabricação/validade |
| Movimento de Estoque | Registro de entrada ou saída de produto |
| Saldo de Estoque | Quantidade disponível por produto/depósito/lote |
| Reserva | Quantidade separada para um pedido ainda não faturado |
| Transferência | Movimentação de produto entre depósitos |
| Inventário | Contagem física para reconciliação com saldo do sistema |
| Requisição de Almoxarifado | Solicitação interna de material |
| Cautela | Empréstimo de ferramenta/equipamento a um funcionário |

## Requirements

### Requirement 1: Movimentação de Estoque

**User Story:** Como estoquista, quero registrar entradas e saídas de produtos, para que o saldo esteja sempre atualizado.

#### Acceptance Criteria

1. Todo movimento deve registrar: produto, depósito, tipo, origem, quantidade, custo unitário
2. O saldo em `saldo_estoque` deve ser atualizado após cada movimento
3. Tipos de movimento: ENTRADA_COMPRA, SAIDA_VENDA, AJUSTE_POSITIVO, AJUSTE_NEGATIVO, etc.
4. Origens: COMPRA, VENDA, DEVOLUCAO, INVENTARIO, TRANSFERENCIA, PRODUCAO, MANUAL

### Requirement 2: Reserva de Estoque

**User Story:** Como vendedor, quero reservar estoque ao criar um pedido, para garantir disponibilidade.

#### Acceptance Criteria

1. Reserva deve referenciar produto, depósito, origem e quantidade
2. Status: RESERVADO → SEPARADO → FATURADO | CANCELADO
3. Saldo disponível = saldo_quantidade - reservado

### Requirement 3: Transferência entre Depósitos

**User Story:** Como estoquista, quero transferir produtos entre depósitos.

#### Acceptance Criteria

1. Transferência tem depósito origem e destino
2. Status: CRIADA → SEPARADA → EM_TRANSITO → RECEBIDA
3. Ao receber, gera movimentos de SAIDA no origem e ENTRADA no destino

### Requirement 4: Inventário

**User Story:** Como gestor, quero realizar inventário para reconciliar saldo físico com sistema.

#### Acceptance Criteria

1. Inventário é criado por depósito
2. Status: aberto → finalizado
3. Ao finalizar, gera ajustes de estoque para divergências

## Database Tables

```sql
depositos, enderecos_estoque, lotes_produto,
movimentos_estoque, saldo_estoque, reservas_estoque,
transferencias_estoque, transferencia_itens,
inventarios, inventario_itens,
camadas_custo, requisicoes_almoxarifado, requisicao_itens,
cautelas_ferramentas
```
