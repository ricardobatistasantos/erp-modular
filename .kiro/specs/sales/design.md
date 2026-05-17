# Sales Module — Design

## Module Structure

```
src/modules/sales/src/
  ├── domain/
  │   ├── entity/          ← PedidoVenda, PedidoItem
  │   ├── repository/      ← IPedidoVendaRepository
  │   └── use-case/
  │       └── base.use-case.ts
  ├── application/
  │   └── use-cases/
  │       ├── create-sales.use-case.ts  (stub)
  │       └── get-by-id-sales.use-case.ts (stub)
  ├── infra/
  │   └── repository/
  ├── presentation/
  │   └── controllers/
  │       └── sales.controller.ts
  └── sales.module.ts
```

## Domain Entities

```typescript
class PedidoVenda {
  id: string;
  clienteId: string;
  vendedorId?: string;
  status: 'ABERTO' | 'APROVADO' | 'FATURADO' | 'CANCELADO';
  dataPedido: Date;
  valorTotal: number;
  itens: PedidoItem[];
  createdAt: Date;
  updatedAt: Date;
}

class PedidoItem {
  id: string;
  pedidoId: string;
  produtoId: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number; // computed
}
```

## Integration Points

| Módulo | Integração |
|---|---|
| `person/client` | Validar cliente existente |
| `person/salesperson` | Vincular vendedor ao pedido |
| `product/product` | Validar produto e preço |
| `inventory-control` | Reservar e baixar estoque |
| `finance/accounts-receivable` | Gerar conta a receber no faturamento |

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
| POST | /sales | Criar pedido de venda |
| GET | /sales | Listar pedidos |
| GET | /sales/:id | Buscar pedido por ID |
| PUT | /sales/:id/approve | Aprovar pedido |
| PUT | /sales/:id/invoice | Faturar pedido |
| PUT | /sales/:id/cancel | Cancelar pedido |
