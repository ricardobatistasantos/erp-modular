# Product Module — Requirements

## Overview

O domínio de produtos cobre o cadastro de produtos, categorias e subcategorias. Produtos são a base para vendas, compras e controle de estoque.

## Submodules

| Módulo | Responsabilidade |
|---|---|
| `product/product` | Cadastro de produtos |
| `product/category` | Categorias de produtos |
| `product/sub-category` | Subcategorias vinculadas a categorias |

## Glossary

| Termo | Definição |
|---|---|
| Produto | Item comercializável com preço de compra, venda e estoque |
| Categoria | Agrupamento de alto nível de produtos |
| Subcategoria | Agrupamento específico dentro de uma categoria |
| GTIN | Código de barras global (EAN-13) |
| Código Interno | Código próprio da empresa para o produto |
| Unidade de Medida | Unidade de quantificação do produto (UN, KG, L, etc.) |
| Marca | Fabricante ou marca do produto |

## Requirements

### Requirement 1: Cadastro de Produto

**User Story:** Como estoquista, quero cadastrar um produto com seus dados comerciais, para que ele possa ser vendido e controlado no estoque.

#### Acceptance Criteria

1. O produto deve ter nome, valor de compra, valor de venda e quantidade em estoque
2. Deve estar vinculado a uma subcategoria, unidade de medida e marca
3. GTIN e código interno são opcionais
4. Data de cadastro é obrigatória

### Requirement 2: Cadastro de Categoria

**User Story:** Como administrador, quero cadastrar categorias para organizar os produtos.

#### Acceptance Criteria

1. Categoria deve ter nome obrigatório
2. Descrição é opcional

### Requirement 3: Cadastro de Subcategoria

**User Story:** Como administrador, quero cadastrar subcategorias vinculadas a uma categoria.

#### Acceptance Criteria

1. Subcategoria deve ter nome e referência à categoria pai
2. Descrição é opcional

## Database Tables

```sql
produto_categoria    (id UUID PK, nome, descricao?)
produto_sub_categoria(id UUID PK, produto_categoria_id FK, nome, descricao?)
produto_unidade_medida(id UUID PK, sigla, pode_fracionar CHAR(1), descricao?)
produto_marca        (id UUID PK, nome, descricao?)
produto              (id UUID PK, produto_sub_categoria_id FK, produto_unidade_medida_id FK, produto_marca_id FK,
                      nome, gtin?, codigo_interno?, valor_compra, valor_venda, quantidade_estoque, cadastro DATE, descricao?)
```
