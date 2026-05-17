# Finance Module — Tasks

## Status Legend
- [ ] Pendente
- [x] Concluído
- [~] Em progresso

---

## Accounts Payable

- [ ] Criar entidade `ContaPagar`
- [ ] Criar `IAccountsPayableRepository`
- [ ] Criar `CreateAccountsPayableDTO` e `UpdateAccountsPayableDTO`
- [ ] Implementar `CreateAccountsPayableUseCase`
- [ ] Implementar `GetByIdAccountsPayableUseCase`
- [ ] Implementar `AccountsPayableRepository`
- [ ] Implementar controller com CRUD completo

## Accounts Receivable

- [ ] Criar entidade `ContaReceber`
- [ ] Criar `IAccountsReceivableRepository`
- [ ] Criar `CreateAccountsReceivableDTO` e `UpdateAccountsReceivableDTO`
- [ ] Implementar `CreateAccountsReceivableUseCase`
- [ ] Implementar `GetByIdAccountsReceivableUseCase`
- [ ] Implementar `AccountsReceivableRepository`
- [ ] Implementar controller com CRUD completo

## Banks

- [ ] Criar entidades `Banco` e `BancoAgencia`
- [ ] Criar `IBancoRepository` e `IBancoAgenciaRepository`
- [ ] Implementar use cases de CRUD
- [ ] Implementar repositórios
- [ ] Implementar controller

## Bank Accounts

- [ ] Criar entidade `BancoConta`
- [ ] Criar `IBancoContaRepository`
- [ ] Implementar use cases de CRUD
- [ ] Implementar repositório
- [ ] Implementar controller

## Cash Flow

- [ ] Criar entidade `LancamentoFinanceiro`
- [ ] Criar `ILancamentoFinanceiroRepository`
- [ ] Implementar `CreateLancamentoUseCase`
- [ ] Implementar `GetCashFlowByPeriodUseCase`
- [ ] Implementar repositório
- [ ] Implementar controller

## Payment Methods

- [ ] Definir schema da tabela `formas_pagamento`
- [ ] Criar entidade `FormaPagamento`
- [ ] Implementar CRUD completo

## Treasury

- [ ] Criar entidades `BaixaFinanceira` e `EstornoFinanceiro`
- [ ] Criar `IBaixaFinanceiraRepository`
- [ ] Implementar `CreateBaixaUseCase` (gera lançamento financeiro)
- [ ] Implementar `CreateEstornoUseCase` (gera lançamento de estorno)
- [ ] Implementar repositórios
- [ ] Implementar controller

## Shared Finance

- [ ] Criar entidade `Parcela`
- [ ] Criar `IParcelaRepository`
- [ ] Implementar lógica de geração de parcelas
- [ ] Criar entidade `HistoricoContas`
- [ ] Implementar registro automático de histórico em alterações de status
