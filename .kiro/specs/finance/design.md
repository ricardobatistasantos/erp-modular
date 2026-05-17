# Finance Module — Design

## Architecture

Todos os módulos financeiros seguem a mesma estrutura de Clean Architecture:

```
src/modules/finance/<module>/src/
  ├── domain/
  │   ├── entity/
  │   ├── repository/     ← interfaces
  │   └── use-case/
  │       └── base.use-case.ts
  ├── application/
  │   └── use-cases/
  ├── infra/
  │   └── repository/     ← implementações pg-promise
  ├── presentation/
  │   ├── controllers/
  │   └── listeners/      ← BullMQ consumers (futuro)
  └── <module>.module.ts
```

## Status por Submodule

| Módulo | Domain | Use Cases | Repository | Controller | Status |
|---|---|---|---|---|---|
| accounts-payable | ⬜ vazio | ⬜ stub | ⬜ vazio | ✅ existe | 🔴 Pendente |
| accounts-receivable | ⬜ vazio | ⬜ stub | ⬜ vazio | ✅ existe | 🔴 Pendente |
| banks | ⬜ vazio | ⬜ stub | ⬜ vazio | ✅ existe | 🔴 Pendente |
| bank-accounts | ⬜ vazio | ⬜ stub | ⬜ vazio | ✅ existe | 🔴 Pendente |
| cash-flow | ⬜ vazio | ⬜ stub | ⬜ vazio | ✅ existe | 🔴 Pendente |
| payment-methods | ⬜ vazio | ⬜ stub | ⬜ vazio | ✅ existe | 🔴 Pendente |
| treasury | ⬜ vazio | ⬜ stub | ⬜ vazio | ✅ existe | 🔴 Pendente |

## Accounts Payable

**Entidade:** `ContaPagar`
**Tabela:** `contas_pagar`
**Endpoints:** POST /accounts-payable, GET /accounts-payable, GET /accounts-payable/:id, PUT /accounts-payable/:id

Fluxo de criação:
```
1. Criar conta a pagar
2. Gerar parcelas (se parcelado)
3. Registrar no histórico
```

## Accounts Receivable

**Entidade:** `ContaReceber`
**Tabela:** `contas_receber`
**Endpoints:** POST /accounts-receivable, GET /accounts-receivable, GET /accounts-receivable/:id, PUT /accounts-receivable/:id

## Banks

**Entidade:** `Banco`, `BancoAgencia`
**Tabelas:** `banco`, `banco_agencia`
**Endpoints:** CRUD completo

## Bank Accounts

**Entidade:** `BancoConta`
**Tabela:** `banco_conta`
**Endpoints:** CRUD completo

## Cash Flow

**Entidade:** `LancamentoFinanceiro`
**Tabela:** `lancamentos_financeiros`
**Endpoints:** GET /cash-flow (listagem por período), POST /cash-flow (lançamento manual)

## Payment Methods

**Entidade:** `FormaPagamento`
**Tabela:** a definir (não existe no schema atual)
**Endpoints:** CRUD completo

## Treasury

**Entidade:** `BaixaFinanceira`, `EstornoFinanceiro`
**Tabelas:** `baixas_financeiras`, `estornos_financeiros`
**Endpoints:** POST /treasury/baixa, POST /treasury/estorno

## Queue Integration (BullMQ)

Módulos financeiros podem publicar eventos via BullMQ para:
- Notificar vencimento de contas
- Disparar geração de relatórios
- Integrar com módulo fiscal

Listeners ficam em `presentation/listeners/`.
