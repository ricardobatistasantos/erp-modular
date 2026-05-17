# Sales Module — Tasks

## Status Legend
- [ ] Pendente
- [x] Concluído
- [~] Em progresso

---

## Domain

- [ ] Criar entidade `PedidoVenda`
- [ ] Criar entidade `PedidoItem`
- [ ] Criar `IPedidoVendaRepository`
- [ ] Criar `IPedidoItemRepository`
- [ ] Definir schema SQL das tabelas `pedidos_venda` e `pedido_itens`

## Application

- [ ] Criar `CreateSalesDTO` e `UpdateSalesDTO`
- [ ] Implementar `CreateSalesUseCase`
- [ ] Implementar `GetByIdSalesUseCase`
- [ ] Implementar `ApproveSalesUseCase`
- [ ] Implementar `InvoiceSalesUseCase` (integra com estoque e financeiro)
- [ ] Implementar `CancelSalesUseCase`

## Infrastructure

- [ ] Implementar `PedidoVendaRepository`
- [ ] Implementar `PedidoItemRepository`

## Presentation

- [ ] Implementar controller com endpoints planejados

## Module

- [ ] Registrar providers no `SalesModule`

## Integrações

- [ ] Integrar com `InventoryControlModule` para reserva de estoque
- [ ] Integrar com `AccountsReceivableModule` para geração de conta a receber
- [ ] Integrar com `SalespersonModule` para vincular vendedor
