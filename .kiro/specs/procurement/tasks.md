# Procurement Module — Tasks

## Status Legend
- [ ] Pendente
- [x] Concluído
- [~] Em progresso

---

## Domain

- [ ] Criar entidade `PedidoCompra`
- [ ] Criar entidade `PedidoCompraItem`
- [ ] Criar `IPedidoCompraRepository`
- [ ] Definir schema SQL das tabelas

## Application

- [ ] Criar `CreateProcurementDTO`
- [ ] Implementar `CreateProcurementUseCase`
- [ ] Implementar `GetByIdProcurementUseCase`
- [ ] Implementar `ReceiveProcurementUseCase` (integra estoque + financeiro)
- [ ] Implementar `CancelProcurementUseCase`

## Infrastructure

- [ ] Implementar `PedidoCompraRepository`

## Presentation

- [ ] Implementar controller com endpoints planejados

## Module

- [ ] Registrar providers no `ProcurementModule`

## Integrações

- [ ] Integrar com `InventoryControlModule` para entrada de estoque
- [ ] Integrar com `AccountsPayableModule` para geração de conta a pagar
