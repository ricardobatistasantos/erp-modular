# Implementation Plan: Supplier Module

## Overview

Implementação completa do módulo de Fornecedor (Supplier) seguindo Clean Architecture com o mesmo padrão do módulo de Cliente. O plano cobre: interface de repositório no domínio, DTOs com validação, 5 use cases na camada de aplicação, repositório pg-promise na infra, controller com todos os endpoints, registro completo do módulo, e testes unitários com property-based testing via fast-check.

## Tasks

- [x] 1. Domain layer - Repository interface
  - [x] 1.1 Create ISupplierRepository interface
    - Create file `src/modules/person/supplier/src/domain/repository/supplier.interface.repository.ts`
    - Define interface with methods: `create(data, transaction?)`, `findById(id)`, `findAll(page, limit)`, `update(id, data, transaction?)`, `delete(id)`
    - Import and use the existing `Supplier` entity for return types
    - Follow the same pattern as `IClientRepository`
    - _Requirements: 8.1_

- [x] 2. Application layer - DTOs
  - [x] 2.1 Create SupplierDataDTO
    - Create file `src/modules/person/supplier/src/application/dto/supplier.dto.ts`
    - Add `categoria` field: optional string, max 100 characters, with pt-BR validation messages
    - Add `prazoEntregaDias` field: optional integer, min 0, max 365, with pt-BR validation messages
    - Use decorators: `@IsOptional`, `@IsString`, `@MaxLength`, `@IsInt`, `@Min`, `@Max`
    - _Requirements: 6.1, 6.2_

  - [x] 2.2 Create CreateSupplierDTO
    - Create file `src/modules/person/supplier/src/application/dto/create-supplier.dto.ts`
    - Add `pessoa` field with `@ValidateNested()` and `@Type(() => CreatePersonDTO)` using the shared DTO from `@person/shared/dto/create-person.dto`
    - Add `fornecedor` field with `@ValidateNested()` and `@Type(() => SupplierDataDTO)`
    - _Requirements: 6.3, 6.4_

  - [x] 2.3 Create UpdateSupplierDTO with nested UpdateSupplierPessoaDTO
    - Create file `src/modules/person/supplier/src/application/dto/update-supplier.dto.ts`
    - Define `UpdateSupplierPessoaDTO` class with optional fields: nome, email, observacao, tipo (required when pessoa provided), fisica, juridica, contatos, enderecos — using shared DTOs (FisicaDTO, JuridicaDTO, ContactDTO, AddressDTO)
    - Define `UpdateSupplierDTO` with optional `pessoa` and optional `fornecedor` (SupplierDataDTO)
    - Follow the same pattern as `UpdateClientDTO`
    - _Requirements: 6.6, 4.3_

  - [x] 2.4 Create PaginationQueryDTO
    - Create file `src/modules/person/supplier/src/application/dto/pagination-query.dto.ts`
    - Add `page` field: optional integer, min 1, default 1
    - Add `limit` field: optional integer, min 1, max 100, default 10
    - Follow the same pattern as the client's PaginationQueryDTO
    - _Requirements: 3.6_

- [x] 3. Application layer - Use Cases
  - [x] 3.1 Implement CreateSupplierUseCase
    - Rewrite `src/modules/person/supplier/src/application/use-cases/create-supplier.use-case.ts`
    - Inject: `DATABASE_CONNECTION`, `IPersonRepository`, `IPersonFisicaRepository`, `IPersonJuridicaRepository`, `IContactRepository`, `IAddressRepository`, `ISupplierRepository`
    - Implement transactional creation: create person (with `fornecedor: 1` flag), conditionally create personFisica/personJuridica, create contacts, create addresses, create supplier record
    - Follow the exact same orchestration pattern as `CreateClientUseCase`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.8, 1.9_

  - [x] 3.2 Implement GetByIdSupplierUseCase
    - Rewrite `src/modules/person/supplier/src/application/use-cases/get-by-id-supplier.use-case.ts`
    - Inject `ISupplierRepository`
    - Call `findById`, throw `NotFoundException('Fornecedor não encontrado')` if null
    - Follow the same pattern as `GetByIdClientUseCase`
    - _Requirements: 2.1, 2.2_

  - [x] 3.3 Implement FindAllSuppliersUseCase
    - Create file `src/modules/person/supplier/src/application/use-cases/find-all-suppliers.use-case.ts`
    - Inject `ISupplierRepository`
    - Accept `PaginationQueryDTO`, default page=1, limit=10
    - Return `{ data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }`
    - Follow the same pattern as `FindAllClientsUseCase`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.7_

  - [x] 3.4 Implement UpdateSupplierUseCase
    - Create file `src/modules/person/supplier/src/application/use-cases/update-supplier.use-case.ts`
    - Inject: `DATABASE_CONNECTION`, `IPersonRepository`, `IPersonFisicaRepository`, `IPersonJuridicaRepository`, `IContactRepository`, `IAddressRepository`, `ISupplierRepository`
    - Check existence via `findById`, throw `NotFoundException` if not found
    - Implement transactional update: update person fields, update fisica/juridica, delete+recreate contacts, delete+recreate addresses, update supplier fields
    - Return full updated record via `findById` after transaction
    - Follow the same pattern as `UpdateClientUseCase`
    - _Requirements: 4.1, 4.2, 4.5, 4.6, 4.7_

  - [x] 3.5 Implement DeleteSupplierUseCase
    - Create file `src/modules/person/supplier/src/application/use-cases/delete-supplier.use-case.ts`
    - Inject `ISupplierRepository`
    - Check existence via `findById`, throw `NotFoundException('Fornecedor não encontrado')` if not found
    - Call `delete(id)` for soft delete
    - Follow the same pattern as `DeleteClientUseCase`
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 4. Infrastructure layer - Repository implementation
  - [x] 4.1 Implement SupplierRepository
    - Create file `src/modules/person/supplier/src/infra/repository/supplier.repository.ts`
    - Implement `ISupplierRepository` interface
    - Inject `DATABASE_CONNECTION` via `@Inject`
    - Implement `create`: INSERT INTO fornecedor (pessoa_id, categoria, prazo_entrega_dias) VALUES ($1, $2, $3) RETURNING *
    - Implement `findById`: SELECT with INNER JOIN pessoa WHERE f.id = $1 AND p.ativo = true
    - Implement `findAll`: SELECT with INNER JOIN pessoa WHERE p.ativo = true ORDER BY p.nome ASC LIMIT/OFFSET + COUNT query
    - Implement `update`: UPDATE fornecedor SET categoria = COALESCE, prazo_entrega_dias = COALESCE WHERE id RETURNING *
    - Implement `delete`: UPDATE pessoa SET ativo = false WHERE id = (SELECT pessoa_id FROM fornecedor WHERE id = $1)
    - _Requirements: 8.2, 8.3, 8.4, 8.5_

- [x] 5. Presentation layer - Controller
  - [x] 5.1 Implement SupplierController with all endpoints
    - Rewrite `src/modules/person/supplier/src/presentation/controllers/supplier.controller.ts`
    - Inject all 5 use cases in constructor
    - `@Get(':id')` → `getByIdSupplierUseCase.execute({ id })`
    - `@Get()` → `findAllSuppliersUseCase.execute(query: PaginationQueryDTO)`
    - `@Post()` → `createSupplierUseCase.execute(createSupplierDto: CreateSupplierDTO)`
    - `@Put(':id')` → `updateSupplierUseCase.execute({ id, updateData })`
    - `@Delete(':id')` with `@HttpCode(204)` → `deleteSupplierUseCase.execute({ id })`
    - Follow the same pattern as `ClientController`
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_

- [x] 6. Module registration
  - [x] 6.1 Update SupplierModule with all providers
    - Rewrite `src/modules/person/supplier/src/supplier.module.ts`
    - Register `SupplierController` in controllers array
    - Register `{ provide: 'ISupplierRepository', useClass: SupplierRepository }`
    - Register shared repositories: `IPersonRepository`, `IPersonFisicaRepository`, `IPersonJuridicaRepository`, `IContactRepository`, `IAddressRepository`
    - Register all 5 use cases as direct class providers
    - Follow the same pattern as `ClientModule`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 7. Checkpoint - Ensure all code compiles and module bootstraps
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Unit tests - Use case tests
  - [x] 8.1 Write unit tests for CreateSupplierUseCase
    - Create file `src/modules/person/supplier/tests/unit/create-supplier.use-case.spec.ts`
    - Mock all repositories and DATABASE_CONNECTION
    - Test: calls personRepository.create with `fornecedor: 1` flag
    - Test: creates personFisica when tipo='F' and fisica provided
    - Test: creates personJuridica when tipo='J' and juridica provided
    - Test: creates contacts and addresses when provided
    - Test: calls supplierRepository.create with supplier-specific fields
    - Test: all operations happen within the same transaction
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 8.2 Write unit tests for GetByIdSupplierUseCase
    - Create file `src/modules/person/supplier/tests/unit/get-by-id-supplier.use-case.spec.ts`
    - Mock ISupplierRepository
    - Test: returns supplier data when found
    - Test: throws NotFoundException when not found
    - _Requirements: 2.1, 2.2_

  - [x] 8.3 Write unit tests for FindAllSuppliersUseCase
    - Create file `src/modules/person/supplier/tests/unit/find-all-suppliers.use-case.spec.ts`
    - Mock ISupplierRepository
    - Test: defaults to page=1, limit=10
    - Test: returns correct meta with totalPages calculation
    - Test: returns empty data array when no results
    - _Requirements: 3.1, 3.2, 3.3, 3.7_

  - [x] 8.4 Write unit tests for UpdateSupplierUseCase
    - Create file `src/modules/person/supplier/tests/unit/update-supplier.use-case.spec.ts`
    - Mock all repositories and DATABASE_CONNECTION
    - Test: throws NotFoundException when supplier not found
    - Test: updates person fields within transaction
    - Test: deletes and recreates contacts when provided
    - Test: deletes and recreates addresses when provided
    - Test: updates supplier-specific fields
    - Test: returns full updated record
    - _Requirements: 4.1, 4.2, 4.5, 4.6, 4.7_

  - [x] 8.5 Write unit tests for DeleteSupplierUseCase
    - Create file `src/modules/person/supplier/tests/unit/delete-supplier.use-case.spec.ts`
    - Mock ISupplierRepository
    - Test: calls delete when supplier exists
    - Test: throws NotFoundException when supplier not found
    - _Requirements: 5.1, 5.3_

- [ ] 9. Property-based tests with fast-check
  - [ ]* 9.1 Write property test for creation orchestration
    - Create file `src/modules/person/supplier/tests/property/create-supplier.property.spec.ts`
    - **Property 1: Creation orchestrates all sub-records based on payload content**
    - Generate arbitrary valid CreateSupplierDTO payloads with fast-check
    - Assert: personRepository.create called with `fornecedor: 1`, supplierRepository.create called with supplier fields, conditional calls for fisica/juridica/contacts/addresses based on payload content
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.8, 1.9**

  - [ ]* 9.2 Write property test for transaction rollback on creation failure
    - Create file `src/modules/person/supplier/tests/property/create-supplier-rollback.property.spec.ts`
    - **Property 2: Transaction rollback on creation failure**
    - Generate arbitrary failure points during transaction
    - Assert: transaction is rolled back and no partial data persisted
    - **Validates: Requirements 1.6**

  - [ ]* 9.3 Write property test for CreateDTO validation
    - Create file `src/modules/person/supplier/tests/property/create-supplier-validation.property.spec.ts`
    - **Property 3: Create DTO validation rejects invalid payloads**
    - Generate arbitrary invalid payloads (empty nome, invalid tipo, categoria > 100 chars, prazoEntregaDias outside [0,365])
    - Assert: validation fails with appropriate error messages
    - **Validates: Requirements 1.7, 6.1, 6.2, 6.3, 6.4, 6.5**

  - [ ]* 9.4 Write property test for FindById correctness
    - Create file `src/modules/person/supplier/tests/property/get-by-id-supplier.property.spec.ts`
    - **Property 4: FindById returns correct supplier data for active suppliers**
    - Generate arbitrary supplier IDs and repository responses
    - Assert: returns data for active suppliers, throws NotFoundException for missing/inactive
    - **Validates: Requirements 2.1, 2.2**

  - [ ]* 9.5 Write property test for pagination meta calculation
    - Create file `src/modules/person/supplier/tests/property/find-all-suppliers-pagination.property.spec.ts`
    - **Property 5: Pagination meta calculation is correct**
    - Generate arbitrary total counts and page/limit combinations
    - Assert: totalPages = Math.ceil(total / limit), data.length <= limit, correct page and limit in meta
    - **Validates: Requirements 3.2, 3.3, 3.7**

  - [ ]* 9.6 Write property test for pagination DTO validation
    - Create file `src/modules/person/supplier/tests/property/pagination-validation.property.spec.ts`
    - **Property 6: Pagination DTO validation rejects invalid parameters**
    - Generate arbitrary invalid page (<1) and limit (outside [1,100]) values
    - Assert: validation rejects with appropriate error messages
    - **Validates: Requirements 3.6**

  - [ ]* 9.7 Write property test for update orchestration
    - Create file `src/modules/person/supplier/tests/property/update-supplier.property.spec.ts`
    - **Property 7: Update orchestrates partial updates within a transaction**
    - Generate arbitrary UpdateSupplierDTO with random subsets of fields
    - Assert: only provided sections trigger repository calls, all within transaction
    - **Validates: Requirements 4.1, 4.2, 4.6**

  - [ ]* 9.8 Write property test for UpdateDTO validation
    - Create file `src/modules/person/supplier/tests/property/update-supplier-validation.property.spec.ts`
    - **Property 8: Update DTO validation rejects invalid payloads**
    - Generate arbitrary invalid update payloads (categoria > 100, prazoEntregaDias outside range, invalid email)
    - Assert: validation rejects with status 400 and error messages
    - **Validates: Requirements 4.3, 4.4, 6.6**

  - [ ]* 9.9 Write property test for soft delete behavior
    - Create file `src/modules/person/supplier/tests/property/delete-supplier.property.spec.ts`
    - **Property 9: Soft delete sets pessoa.ativo to false**
    - Generate arbitrary existing/non-existing supplier IDs
    - Assert: delete called for existing, NotFoundException for non-existing
    - **Validates: Requirements 5.1, 5.2, 5.3**

  - [ ]* 9.10 Write property test for supplier-specific field validation boundaries
    - Create file `src/modules/person/supplier/tests/property/supplier-fields-validation.property.spec.ts`
    - **Property 10: Supplier-specific field validation boundaries**
    - Generate arbitrary strings for categoria (varying lengths around 100) and numbers for prazoEntregaDias (around boundaries 0 and 365)
    - Assert: accepts if and only if categoria.length <= 100 and prazoEntregaDias is integer in [0, 365]
    - **Validates: Requirements 6.1, 6.2**

- [x] 10. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The supplier module follows the exact same architectural pattern as the client module
- Shared person repositories are reused via DI tokens, not duplicated
- All validation messages must be in Portuguese (pt-BR)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1", "2.4"] },
    { "id": 1, "tasks": ["2.2", "2.3"] },
    { "id": 2, "tasks": ["3.1", "3.2", "3.3", "3.4", "3.5", "4.1"] },
    { "id": 3, "tasks": ["5.1", "6.1"] },
    { "id": 4, "tasks": ["8.1", "8.2", "8.3", "8.4", "8.5"] },
    { "id": 5, "tasks": ["9.1", "9.2", "9.3", "9.4", "9.5", "9.6", "9.7", "9.8", "9.9", "9.10"] }
  ]
}
```
