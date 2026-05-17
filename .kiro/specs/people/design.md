# People Module — Design

## Architecture

O módulo `person` segue Clean Architecture com as camadas: `domain`, `application`, `infra`, `presentation`.

O contexto `shared` expõe interfaces de repositório e DTOs reutilizados por todos os subcontextos de pessoa.

```
src/modules/person/
  ├── shared/
  │   ├── domain/repository/       ← interfaces (IPersonRepository, etc.)
  │   ├── dto/                     ← CreatePersonDTO, FisicaDTO, JuridicaDTO, ContactDTO, AddressDTO
  │   ├── entities/                ← Address, Contact
  │   └── infra/repository/        ← implementações pg-promise
  │
  ├── employee/src/
  ├── client/src/
  ├── supplier/src/
  └── transporter/src/
```

## Aggregate Root: Person

Patterns:
- Aggregate Root: `Person`
- Person pode ser: `PhysicalPerson`, `LegalPerson`, `Customer`, `Supplier`, `Employee`, `Carrier`
- Flags booleanas na tabela `pessoa` indicam os papéis ativos (`colaborador`, `cliente`, `transportadora`)

## Database Schema

```sql
-- Tabela base
pessoa (id UUID PK, nome, email UNIQUE, tipo ENUM('F','J'), colaborador INT, cliente INT, transportadora INT, observacao, createdAt, updatedAt)

-- Extensões
pessoa_fisica  (id UUID PK, pessoa_id FK, cpf UNIQUE)
pessoa_juridica(id UUID PK, pessoa_id FK, cnpj UNIQUE)
pessoa_contato (id UUID PK, pessoa_id FK, tipo_contato ENUM, telefone)
pessoa_endereco(id UUID PK, pessoa_id FK, logradouro, numero, bairro, cidade, uf, cep, tipo_endereco ENUM)

-- Papéis
colaborador (id UUID PK, pessoa_id FK, matricula UNIQUE, admissao, demissao)
cliente     (id UUID PK, pessoa_id FK, taxa_desconto, limit_credito)
fornecedor  (id UUID PK, pessoa_id FK)
transportadora (id UUID PK, pessoa_id FK)
vendedor    (id UUID PK, colaborador_id FK, comissao, meta_venda)
```

## Transaction Pattern

Toda criação de pessoa usa `connection().tx(...)` do pg-promise para garantir atomicidade:

```
tx('Create Person') {
  1. personRepository.create(pessoa)
  2. personFisicaRepository.create(fisica) | personJuridicaRepository.create(juridica)
  3. contactRepository.create(contatos[])   [Promise.all]
  4. addressRepository.create(enderecos[])  [Promise.all]
  5. <submodule>Repository.create(dados específicos)
}
```

## Shared Repositories

Todas as implementações ficam em `@person/shared/infra/repository/` e são injetadas via token string nos módulos consumidores:

| Token | Classe |
|---|---|
| `IPersonRepository` | `PersonRepository` |
| `IPersonFisicaRepository` | `PersonFisicaRepository` |
| `IPersonJuridicaRepository` | `PersonJuridicaRepository` |
| `IContactRepository` | `ContactRepository` |
| `IAddressRepository` | `AddressRepository` |

## Path Aliases

Configurados no `tsconfig.json`:
- `@person/shared/*` → `src/modules/person/shared/*`
- `@person/employee/*` → `src/modules/person/employee/*`

## Validation

- CPF/CNPJ: validação de formato (11 e 14 dígitos respectivamente)
- Email: único por pessoa (índice único no banco)
- Matrícula: única por colaborador (índice único no banco)