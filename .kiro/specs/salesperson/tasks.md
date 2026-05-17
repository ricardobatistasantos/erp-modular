# Salesperson Module — Tasks

## Status Legend
- [ ] Pendente
- [x] Concluído
- [~] Em progresso

---

## Domain

- [ ] Criar `salesperson.entity.ts` — Salesperson com id, colaboradorId, comissao, metaVendas, createdAt, updatedAt
- [ ] Criar `salesperson.interface.repository.ts` — ISalespersonRepository com create, findById, findAll
- [ ] Criar `base.use-case.ts` — interface BaseUseCase<I, O>

## Application

- [ ] Criar `salesperson.dto.ts` — SalespersonDTO
- [ ] Criar `create-salesperson.dto.ts` — CreateSalespersonDTO com colaboradorId, comissao, metaVendas
- [ ] Implementar `create-salesperson.use-case.ts` — insert simples na tabela `vendedor`
- [ ] Implementar `get-by-id-salesperson.use-case.ts` — query por id com join em colaborador e pessoa

## Infrastructure

- [ ] Implementar `salesperson.repository.ts`
  - [ ] Método `create` — INSERT INTO vendedor
  - [ ] Método `findById` — SELECT com JOIN colaborador + pessoa
  - [ ] Método `findAll` — SELECT com JOIN colaborador + pessoa

## Presentation

- [ ] Criar `salesperson.controller.ts`
  - [ ] `POST /salesperson` → CreateSalespersonUseCase
  - [ ] `GET /salesperson` → findAll
  - [ ] `GET /salesperson/:id` → GetByIdSalespersonUseCase
  - [ ] `PUT /salesperson/:id` → stub

## Module

- [ ] Criar `salesperson.module.ts` — registrar ISalespersonRepository e use cases
- [ ] Registrar `SalespersonModule` no `AppModule`

## Database

- [ ] Adicionar `created_at` e `updated_at` na tabela `vendedor` (schema atual não possui)
- [ ] Criar migration/script SQL com a tabela atualizada

## Futuro

- [ ] Implementar `UpdateSalespersonUseCase`
- [ ] Adicionar validação: comissão entre 0 e 1
- [ ] Adicionar validação: meta de vendas positiva
- [ ] Criar testes unitários para `CreateSalespersonUseCase`
