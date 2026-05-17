# Inventory Control Module — Design

## Module Structure

```
src/modules/inventory-control/src/
  ├── domain/
  │   ├── entity/          ← MovimentoEstoque, SaldoEstoque, Deposito, Lote, etc.
  │   ├── repository/      ← interfaces
  │   └── use-case/
  │       └── base.use-case.ts
  ├── application/
  │   └── use-cases/
  │       ├── create-inventory-control.use-case.ts  (stub)
  │       └── get-by-id-inventory-control.use-case.ts (stub)
  ├── infra/
  │   └── repository/
  ├── presentation/
  │   └── controllers/
  │       └── inventory-control.controller.ts
  └── inventory-control.module.ts
```

## Core Aggregates

```typescript
class MovimentoEstoque {
  id: string;
  produtoId: string;
  depositoId: string;
  enderecoId?: string;
  loteId?: string;
  tipo: EstoqueTipoMovimento;
  origem: EstoqueOrigem;
  origemId?: string;
  quantidade: number;
  custoUnitario: number;
  valorTotal: number; // computed
  observacao?: string;
  usuarioId?: string;
  createdAt: Date;
}

class SaldoEstoque {
  id: string;
  produtoId: string;
  depositoId: string;
  enderecoId?: string;
  loteId?: string;
  saldoQuantidade: number;
  reservado: number;
  disponivel: number; // computed: saldoQuantidade - reservado
  custoMedio: number;
  updatedAt: Date;
}
```

## Saldo Update Strategy

Ao criar um `MovimentoEstoque`, o `SaldoEstoque` deve ser atualizado via UPSERT:

```sql
INSERT INTO saldo_estoque (produto_id, deposito_id, ...)
VALUES (...)
ON CONFLICT (produto_id, deposito_id, endereco_id, lote_id)
DO UPDATE SET
  saldo_quantidade = saldo_estoque.saldo_quantidade + EXCLUDED.saldo_quantidade,
  updated_at = now()
```

## Status

| Componente | Status |
|---|---|
| Domain entities | 🔴 Pendente |
| Use cases | 🟡 Stub apenas |
| Repositories | 🔴 Pendente |
| Controller | ✅ Existe (stub) |

## API Endpoints (planejados)

| Method | Path | Descrição |
|---|---|---|
| POST | /inventory-control/movement | Registrar movimento |
| GET | /inventory-control/balance/:productId | Saldo por produto |
| POST | /inventory-control/transfer | Criar transferência |
| PUT | /inventory-control/transfer/:id/receive | Receber transferência |
| POST | /inventory-control/inventory | Criar inventário |
| PUT | /inventory-control/inventory/:id/finalize | Finalizar inventário |
