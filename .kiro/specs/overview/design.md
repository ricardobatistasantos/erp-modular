# ERP Modular — Project Overview

## Architecture

**Modular Monolith** com Clean Architecture em NestJS.

```
src/
  ├── infra/
  │   ├── databases/pg-promise/   ← DatabaseModule (Global), conexão master/slave
  │   ├── cache/                  ← Redis (ioredis)
  │   ├── http/                   ← Axios client
  │   └── queue/                  ← BullMQ + RabbitMQ
  │
  └── modules/
      ├── person/
      │   ├── shared/             ← Repositórios e DTOs compartilhados de Pessoa
      │   ├── employee/           ← Colaboradores ✅
      │   ├── client/             ← Clientes ✅
      │   ├── supplier/           ← Fornecedores 🔴
      │   ├── transporter/        ← Transportadoras 🔴
      │   └── salesperson/        ← Vendedores 🔴 (a criar)
      │
      ├── product/
      │   ├── product/            ← Produtos 🔴
      │   ├── category/           ← Categorias 🔴
      │   └── sub-category/       ← Subcategorias 🔴
      │
      ├── finance/
      │   ├── accounts-payable/   ← Contas a Pagar 🔴
      │   ├── accounts-receivable/← Contas a Receber 🔴
      │   ├── banks/              ← Bancos 🔴
      │   ├── bank-accounts/      ← Contas Bancárias 🔴
      │   ├── cash-flow/          ← Fluxo de Caixa 🔴
      │   ├── payment-methods/    ← Formas de Pagamento 🔴
      │   └── treasury/           ← Tesouraria 🔴
      │
      ├── inventory-control/      ← Controle de Estoque 🔴
      ├── sales/                  ← Vendas 🔴
      ├── procurement/            ← Compras 🔴
      ├── tax-management/         ← Gestão Fiscal 🔴
      └── shared/
          ├── auth/               ← Autenticação (desabilitado)
          ├── guards/             ← PermissionsGuard
          ├── decorators/         ← @Permissions
          └── middleware/         ← AuthMiddleware
```

## Layer Rules

```
presentation → application → domain ← infra
                                ↑
                         (interfaces only)
```

- **Domain**: entidades e interfaces de repositório. Sem dependências externas.
- **Application**: use cases stateless. Dependem apenas de interfaces do domain.
- **Infrastructure**: implementações de repositório com pg-promise. Injetadas via token.
- **Presentation**: controllers NestJS. Chamam use cases via injeção de dependência.

## Database

- **pg-promise** com suporte a master/slave via `ReplicType`
- `DATABASE_CONNECTION` é um token global que retorna uma factory `(replic?) => db`
- Transações usam `connection().tx('label', async (t) => { ... })`

## Module Pattern

Todo módulo segue este padrão de registro:

```typescript
@Module({
  providers: [
    { provide: 'I<Entity>Repository', useClass: <Entity>Repository },
    // shared repositories se necessário
    { provide: 'IPersonRepository', useClass: PersonRepository },
    Create<Entity>UseCase,
    GetById<Entity>UseCase,
  ],
  controllers: [<Entity>Controller],
})
export class <Entity>Module {}
```

## Path Aliases (tsconfig.json)

| Alias | Path |
|---|---|
| `@person/shared/*` | `src/modules/person/shared/*` |
| `@person/employee/*` | `src/modules/person/employee/*` |

## Status Summary

| Módulo | Status |
|---|---|
| person/shared | ✅ Implementado |
| person/employee | ✅ Implementado (parcial) |
| person/client | ✅ Implementado (parcial) |
| person/supplier | 🟡 Estrutura criada, sem implementação |
| person/transporter | 🟡 Estrutura criada, sem implementação |
| person/salesperson | 🔴 A criar |
| product/* | 🟡 Estrutura criada, sem implementação |
| finance/* | 🟡 Estrutura criada, sem implementação |
| inventory-control | 🟡 Estrutura criada, sem implementação |
| sales | 🟡 Estrutura criada, sem implementação |
| procurement | 🟡 Estrutura criada, sem implementação |
| tax-management | 🟡 Estrutura criada, sem implementação |
| shared/auth | 🟡 Criado, desabilitado no AppModule |

## Next Priorities

1. **Salesperson module** — necessário para o módulo de vendas
2. **Supplier/Transporter** — completar os módulos de pessoa
3. **Product CRUD** — base para vendas e compras
4. **Finance** — contas a pagar/receber são críticos
5. **Sales** — core do negócio
6. **Auth** — habilitar após employee estar completo
