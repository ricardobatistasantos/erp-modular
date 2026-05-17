# Salesperson Module — Design

## Module Structure

```
src/modules/person/salesperson/src/
  ├── domain/
  │   ├── entity/
  │   │   └── salesperson.entity.ts
  │   ├── repository/
  │   │   └── salesperson.interface.repository.ts
  │   └── use-case/
  │       └── base.use-case.ts
  │
  ├── application/
  │   ├── dto/
  │   │   ├── salesperson.dto.ts
  │   │   └── create-salesperson.dto.ts
  │   └── use-cases/
  │       ├── create-salesperson.use-case.ts
  │       └── get-by-id-salesperson.use-case.ts
  │
  ├── infra/
  │   └── repository/
  │       └── salesperson.repository.ts
  │
  ├── presentation/
  │   └── controllers/
  │       └── salesperson.controller.ts
  │
  └── salesperson.module.ts
```

## Domain Entity

```typescript
class Salesperson {
  id?: string;
  colaboradorId: string;
  comissao: number;
  metaVendas: number;
  createdAt?: Date;
  updatedAt?: Date;
}
```

## Repository Interface

```typescript
interface ISalespersonRepository {
  create(data: any, transaction?: any): Promise<Salesperson>;
  findById(id: string): Promise<Salesperson | null>;
  findAll(): Promise<Salesperson[]>;
}
```

## Use Case: CreateSalespersonUseCase

Diferente do `employee`, o vendedor não cria uma nova pessoa — apenas vincula um colaborador existente:

```
1. Validar que colaboradorId existe (opcional: query na tabela colaborador)
2. salespersonRepository.create({ colaboradorId, comissao, metaVendas })
3. Retornar vendedor criado
```

> Não usa transação complexa pois é uma operação simples de insert.

## Repository: SalespersonRepository

Tabela: `vendedor`

```sql
INSERT INTO vendedor (colaborador_id, comissao, meta_venda)
VALUES ($1, $2, $3)
RETURNING *

SELECT * FROM vendedor WHERE id = $1

SELECT v.*, c.matricula, p.nome
FROM vendedor v
JOIN colaborador c ON c.id = v.colaborador_id
JOIN pessoa p ON p.id = c.pessoa_id
```

## Module Registration

```typescript
@Module({
  providers: [
    { provide: 'ISalespersonRepository', useClass: SalespersonRepository },
    CreateSalespersonUseCase,
    GetByIdSalespersonUseCase,
  ],
  controllers: [SalespersonController],
})
export class SalespersonModule {}
```

## API Endpoints

| Method | Path | Use Case |
|---|---|---|
| POST | /salesperson | CreateSalespersonUseCase |
| GET | /salesperson | GetAllSalespersonUseCase |
| GET | /salesperson/:id | GetByIdSalespersonUseCase |
| PUT | /salesperson/:id | UpdateSalespersonUseCase |

## Diferenças em relação ao Employee

| Aspecto | Employee | Salesperson |
|---|---|---|
| Cria Pessoa? | Sim (transação completa) | Não (vincula colaborador existente) |
| Tabela principal | `colaborador` | `vendedor` |
| Dependência | `@person/shared` | Apenas `DATABASE_CONNECTION` |
| Complexidade | Alta (múltiplos repositórios) | Baixa (repositório único) |

## AppModule Registration

Adicionar `SalespersonModule` no array `imports` do `AppModule`.
