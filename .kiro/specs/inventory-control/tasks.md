# Inventory Control Module — Tasks

## Status Legend
- [ ] Pendente
- [x] Concluído
- [~] Em progresso

---

## Domain

- [ ] Criar entidade `Deposito`
- [ ] Criar entidade `EnderecoEstoque`
- [ ] Criar entidade `LoteProduto`
- [ ] Criar entidade `MovimentoEstoque`
- [ ] Criar entidade `SaldoEstoque`
- [ ] Criar entidade `ReservaEstoque`
- [ ] Criar entidade `TransferenciaEstoque` e `TransferenciaItem`
- [ ] Criar entidade `Inventario` e `InventarioItem`
- [ ] Criar entidade `RequisicaoAlmoxarifado` e `RequisicaoItem`
- [ ] Criar entidade `CautelaFerramenta`
- [ ] Criar interfaces de repositório para cada entidade

## Application

- [ ] Implementar `CreateMovimentoEstoqueUseCase`
- [ ] Implementar `GetSaldoByProdutoUseCase`
- [ ] Implementar `CreateReservaEstoqueUseCase`
- [ ] Implementar `CreateTransferenciaUseCase`
- [ ] Implementar `ReceberTransferenciaUseCase`
- [ ] Implementar `CreateInventarioUseCase`
- [ ] Implementar `FinalizarInventarioUseCase`
- [ ] Implementar `CreateRequisicaoAlmoxarifadoUseCase`

## Infrastructure

- [ ] Implementar repositórios com pg-promise para cada entidade
- [ ] Implementar UPSERT de saldo de estoque

## Presentation

- [ ] Implementar controller com endpoints planejados

## Module

- [ ] Registrar todos os providers no `InventoryControlModule`
