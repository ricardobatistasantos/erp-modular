# Procurement Module — Design

## Module Structure

```
src/modules/procurement/src/
  ├── domain/
  │   ├── entity/          ← PedidoCompra, PedidoCompraItem
  │   ├── repository/      ← IPedidoCompraRepository
  │   └── use-case/
  │       └── base.use-case.ts
  ├── application/
  │   └── use-cases/
  │       ├── create-procurement.use-case.ts  (stub)
  │       └── get-by-id-procurement.use-case.ts (stub)
  ├── infra/
  │   └── repository/
  ├── presentation/
  │   └── controllers/
  │       └── procurement.controller.ts
  └── procurement.module.ts
```

## Integration Points

| Módulo | Integração |
|---|---|
| `person/supplier` | Validar fornecedor existente |
| `product/product` | Validar produto |
| `inventory-control` | Dar entrada no estoque ao receber |
| `finance/accounts-payable` | Gerar conta a pagar ao receber |

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
| POST | /procurement | Criar pedido de compra |
| GET | /procurement | Listar pedidos |
| GET | /procurement/:id | Buscar pedido por ID |
| PUT | /procurement/:id/receive | Receber mercadoria |
| PUT | /procurement/:id/cancel | Cancelar pedido |
