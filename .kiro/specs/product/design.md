# Product Module — Design

## Module Structure

```
src/modules/product/
  ├── product/src/
  │   ├── domain/entity/       ← Product entity
  │   ├── domain/repository/   ← IProductRepository
  │   ├── application/use-cases/
  │   ├── infra/repository/
  │   ├── presentation/controllers/
  │   └── product.module.ts
  │
  ├── category/src/
  │   ├── domain/entity/       ← Category entity
  │   ├── domain/repository/   ← ICategoryRepository
  │   ├── application/use-cases/
  │   ├── infra/repository/
  │   ├── presentation/controllers/
  │   └── category.module.ts
  │
  └── sub-category/src/
      ├── domain/entity/       ← SubCategory entity
      ├── domain/repository/   ← ISubCategoryRepository
      ├── application/use-cases/
      ├── infra/repository/
      ├── presentation/controllers/
      └── sub-category.module.ts
```

## Domain Entities

```typescript
class Product {
  id?: string;
  subCategoriaId: string;
  unidadeMedidaId: string;
  marcaId: string;
  nome: string;
  gtin?: string;
  codigoInterno?: string;
  valorCompra: number;
  valorVenda: number;
  quantidadeEstoque: number;
  cadastro: Date;
  descricao?: string;
}

class Category {
  id?: string;
  nome: string;
  descricao?: string;
}

class SubCategory {
  id?: string;
  categoriaId: string;
  nome: string;
  descricao?: string;
}
```

## Status por Submodule

| Módulo | Domain | Use Cases | Repository | Controller | Status |
|---|---|---|---|---|---|
| product | ⬜ vazio | ⬜ stub | ⬜ vazio | ✅ existe | 🔴 Pendente |
| category | ⬜ vazio | ⬜ stub | ⬜ vazio | ✅ existe | 🔴 Pendente |
| sub-category | ⬜ vazio | ⬜ stub | ⬜ vazio | ✅ existe | 🔴 Pendente |

## API Endpoints

| Method | Path | Descrição |
|---|---|---|
| POST | /product | Criar produto |
| GET | /product | Listar produtos |
| GET | /product/:id | Buscar produto por ID |
| PUT | /product/:id | Atualizar produto |
| POST | /category | Criar categoria |
| GET | /category | Listar categorias |
| POST | /sub-category | Criar subcategoria |
| GET | /sub-category | Listar subcategorias |
