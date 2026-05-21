# Implementation Plan: Client Module — CRUD Completo

## Overview

Implementar o CRUD completo do módulo Client: expandir IClientRepository com todos os métodos, implementar os use cases pendentes (GetById real, FindAll, Update, Delete), criar DTOs, atualizar o controller e registrar tudo no module. Seguir os padrões do módulo Employee.

## Task Dependency Graph

```json
{
  "waves": [
    {"tasks": [1]},
    {"tasks": [2, 3, 4, 5]},
    {"tasks": [6]},
    {"tasks": [7]}
  ]
}
```

## Tasks

- [ ] 1. Expandir IClientRepository e ClientRepository com todos os métodos CRUD
  - [ ] 1.1. Atualizar `src/modules/person/client/src/domain/repository/client.interface.repository.ts` adicionando métodos `findById(id: string): Promise<any | null>`, `findAll(page: number, limit: number): Promise<{ data: any[]; total: number }>`, `update(id: string, data: any): Promise<any>`, `delete(id: string): Promise<void>`
  - [ ] 1.2. Atualizar `src/modules/person/client/src/infra/repository/client.repository.ts` implementando `findById` com SELECT + JOIN em pessoa WHERE ativo = true
  - [ ] 1.3. Implementar `findAll` no ClientRepository com SELECT paginado (LIMIT/OFFSET), JOIN em pessoa, WHERE ativo = true, ORDER BY p.nome ASC, e COUNT para total
  - [ ] 1.4. Implementar `update` no ClientRepository com UPDATE usando COALESCE para campos opcionais (taxa_desconto, limit_credito), RETURNING *
  - [ ] 1.5. Implementar `delete` no ClientRepository com UPDATE em pessoa SET ativo = false WHERE id = (SELECT pessoa_id FROM cliente WHERE id = $1)
  - _Requirements: 2.1, 3.1, 4.1, 5.1_

- [ ] 2. Implementar GetByIdClientUseCase com query real
  - [ ] 2.1. Atualizar `src/modules/person/client/src/application/use-cases/get-by-id-client.use-case.ts` injetando IClientRepository via `@Inject('IClientRepository')` e chamando `findById`, lançando NotFoundException se resultado for null
  - [ ] 2.2. Atualizar `src/modules/person/client/src/presentation/controllers/client.controller.ts` no endpoint `GET :id` para receber `@Param('id') id: string` e passar ao use case
  - _Requirements: 2.1, 2.2_

- [ ] 3. Implementar FindAllClientsUseCase com paginação
  - [ ] 3.1. Criar `src/modules/person/client/src/application/dto/pagination-query.dto.ts` com campos `page?: number` (default 1) e `limit?: number` (default 10)
  - [ ] 3.2. Criar `src/modules/person/client/src/application/use-cases/find-all-clients.use-case.ts` injetando IClientRepository, recebendo PaginationQueryDTO, chamando `findAll(page, limit)` e retornando resultado com metadados (total, page, limit, totalPages)
  - [ ] 3.3. Atualizar `src/modules/person/client/src/presentation/controllers/client.controller.ts` no endpoint `GET /` para receber `@Query()` PaginationQueryDTO e chamar FindAllClientsUseCase
  - [ ] 3.4. Registrar `FindAllClientsUseCase` no `src/modules/person/client/src/client.module.ts`
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 4. Implementar UpdateClientUseCase
  - [ ] 4.1. Criar `src/modules/person/client/src/application/dto/update-client.dto.ts` com campos opcionais `taxaDesconto?: number` e `limiteCredito?: number`
  - [ ] 4.2. Criar `src/modules/person/client/src/application/use-cases/update-client.use-case.ts` injetando IClientRepository, verificando existência com `findById` (lançar NotFoundException se null), chamando `update(id, data)` e retornando resultado
  - [ ] 4.3. Atualizar `src/modules/person/client/src/presentation/controllers/client.controller.ts` no endpoint `PUT` para usar rota `/client/:id`, receber `@Param('id') id: string` e `@Body() updateClientDto: UpdateClientDTO`, chamando UpdateClientUseCase
  - [ ] 4.4. Registrar `UpdateClientUseCase` no `src/modules/person/client/src/client.module.ts`
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 5. Implementar DeleteClientUseCase (soft delete)
  - [ ] 5.1. Criar `src/modules/person/client/src/application/use-cases/delete-client.use-case.ts` injetando IClientRepository, verificando existência com `findById` (lançar NotFoundException se null), chamando `delete(id)`
  - [ ] 5.2. Adicionar endpoint `DELETE /client/:id` no `src/modules/person/client/src/presentation/controllers/client.controller.ts` com `@Param('id') id: string`, chamando DeleteClientUseCase, retornando status 204
  - [ ] 5.3. Registrar `DeleteClientUseCase` no `src/modules/person/client/src/client.module.ts`
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 6. Checkpoint — Verificar integração
  - Garantir que todos os use cases estão registrados no module
  - Garantir que o controller importa e injeta todos os use cases
  - Garantir que não há erros de compilação
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Criar testes unitários para os use cases
  - [ ]* 7.1. Criar `src/modules/person/client/tests/get-by-id-client.use-case.spec.ts` com mock de IClientRepository — testar cenário de sucesso e cenário 404
  - [ ]* 7.2. Criar `src/modules/person/client/tests/find-all-clients.use-case.spec.ts` com mock de IClientRepository — testar paginação padrão, paginação customizada e lista vazia
  - [ ]* 7.3. Criar `src/modules/person/client/tests/update-client.use-case.spec.ts` com mock de IClientRepository — testar atualização parcial, atualização completa e cenário 404
  - [ ]* 7.4. Criar `src/modules/person/client/tests/delete-client.use-case.spec.ts` com mock de IClientRepository — testar soft delete com sucesso e cenário 404
  - _Requirements: 2.1, 2.2, 3.1-3.5, 4.1-4.5, 5.1-5.4_

## Notes

- Seguir o mesmo padrão do módulo Employee como referência
- Usar pg-promise para queries SQL (connection().oneOrNone, connection().any, connection().one)
- Manter compatibilidade com o padrão transacional existente no CreateClientUseCase
- O soft delete usa o campo `ativo` na tabela `pessoa` (não na tabela `cliente`)
- Usar tokens string para injeção de dependência (ex: 'IClientRepository')
- Tasks marcadas com `*` são opcionais (testes unitários)
- A coluna no banco é `limit_credito` (sem 'e'), manter consistência com o schema existente
