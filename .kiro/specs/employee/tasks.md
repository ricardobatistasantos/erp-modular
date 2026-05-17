# Employee Module — Tasks

## Status Legend
- [ ] Pendente
- [x] Concluído
- [~] Em progresso

---

## Domain

- [x] `employee.entity.ts` — Employee com id, personId, matricula, dataAdmissao, dataDemissao, cargo, departamento, vendedor?
- [x] `jobPosition.entity.ts` — JobPosition com nome e salario
- [x] `department.entity.ts` — Department com nome
- [x] `salesProfile.entity.ts` — SalesProfile com comissao e metaVendas
- [x] `employee.interface.repository.ts` — IEmployeeRepository com método create
- [x] `base.use-case.ts` — interface BaseUseCase<I, O>

## Application

- [x] `employee.dto.ts` — EmployeeDTO com matricula, cargo, departamento, vendedor?
- [x] `create-employee.dto.ts` — CreateEmployeeDTO com pessoa, colaborador, createUser
- [x] `create-employee.use-case.ts` — transação completa de criação
- [x] `get-by-id-employee.use-case.ts` — stub (retorna input)

## Infrastructure

- [x] `employee.repository.ts` — INSERT em `colaborador` com pg-promise

## Presentation

- [x] `employee.controller.ts` — GET, GET/:id, POST, PUT

## Module

- [x] `employee.module.ts` — registra todos os providers e controller

## Pendências

- [ ] Implementar `GetByIdEmployeeUseCase` com query real no banco
- [ ] Criar tabelas `cargos` e `departamentos` no schema
- [ ] Persistir `cargo` e `departamento` no banco durante criação
- [ ] Persistir `vendedor` na tabela `vendedor` durante criação
- [ ] Integrar publicação de evento RabbitMQ para `createUser = true`
- [ ] Adicionar `updated_at` na tabela `colaborador`
- [ ] Implementar endpoint PUT com update real
- [ ] Criar testes unitários para `CreateEmployeeUseCase`
