# Client Module — Tasks

## Status Legend
- [ ] Pendente
- [x] Concluído
- [~] Em progresso

---

## Domain

- [ ] `client.entity.ts` — Client com id, personId, taxaDesconto?, limiteCredito?
- [x] `client.interface.repository.ts` — IClientRepository com método create
- [x] `base.use-case.ts`

## Application

- [x] `client.dto.ts` — ClientDTO
- [x] `create-client.dto.ts` — CreateClientDTO com pessoa, cliente, createUser
- [x] `create-client.use-case.ts` — transação completa
- [x] `get-by-id-client.use-case.ts` — stub

## Infrastructure

- [x] `client.repository.ts` — INSERT em `cliente`

## Presentation

- [x] `client.controller.ts` — GET, GET/:id, POST, PUT

## Module

- [x] `client.module.ts`

## Pendências

- [ ] Criar `Client` entity no domain
- [ ] Implementar `GetByIdClientUseCase` com query real
- [ ] Implementar endpoint PUT com update real
- [ ] Criar testes unitários para `CreateClientUseCase`
