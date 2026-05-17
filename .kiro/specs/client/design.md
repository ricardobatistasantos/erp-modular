# Client Module — Design

## Module Structure

```
src/modules/person/client/src/
  ├── domain/
  │   ├── entity/          ← Client entity (a implementar)
  │   ├── repository/
  │   │   └── client.interface.repository.ts  ← IClientRepository
  │   └── use-case/
  │       └── base.use-case.ts
  │
  ├── application/
  │   ├── dto/
  │   │   ├── client.dto.ts
  │   │   └── create-client.dto.ts
  │   └── use-cases/
  │       ├── create-client.use-case.ts
  │       └── get-by-id-client.use-case.ts
  │
  ├── infra/
  │   └── repository/
  │       └── client.repository.ts
  │
  ├── presentation/
  │   └── controllers/
  │       └── client.controller.ts
  │
  └── client.module.ts
```

## Use Case: CreateClientUseCase

Mesmo padrão transacional do `CreateEmployeeUseCase`:

```
tx('Create Client Person') {
  1. personRepository.create({ client: 1, ...pessoa })
  2. personFisicaRepository | personJuridicaRepository
  3. contactRepository (Promise.all)
  4. addressRepository (Promise.all)
  5. clientRepository.create({ pessoaId, ...cliente })
}
```

## API Endpoints

| Method | Path | Use Case |
|---|---|---|
| POST | /client | CreateClientUseCase |
| GET | /client | findAll (stub) |
| GET | /client/:id | GetByIdClientUseCase |
| PUT | /client | updateClient (stub) |

## Pending

- [ ] Criar `Client` entity no domain
- [ ] Implementar `GetByIdClientUseCase` com query real
- [ ] Implementar endpoint PUT com update real
- [ ] Criar testes unitários
