# Implementation Plan: Banks and Accounts

## Overview

Implementação dos módulos de Bancos, Agências Bancárias e Contas Bancárias seguindo a arquitetura modular existente (NestJS + pg-promise). A implementação segue a ordem de dependência: Banks → Bank Agencies → Bank Accounts. Cada módulo inclui entity, repository interface, DTOs, use-cases, infra repository, controller e module wiring.

## Tasks

- [x] 1. Setup e módulo Banks (domínio + aplicação)
  - [x] 1.1 Install fast-check and create Banks domain layer
    - Install `fast-check` as devDependency
    - Create `src/modules/finance/banks/src/domain/entity/bank.entity.ts` with Bank class (id, codigo, nome, urlSite)
    - Create `src/modules/finance/banks/src/domain/repository/bank.interface.repository.ts` with IBankRepository interface (create, findById, findAll, update, delete)
    - Create `src/modules/finance/banks/src/domain/use-case/base.use-case.ts` with BaseUseCase<I, O> interface
    - _Requirements: 1.1, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [x] 1.2 Create Banks DTOs and use-cases
    - Create `src/modules/finance/banks/src/application/dto/create-bank.dto.ts` (codigo, nome, urlSite?)
    - Create `src/modules/finance/banks/src/application/dto/update-bank.dto.ts` (codigo?, nome?, urlSite?)
    - Create `src/modules/finance/banks/src/application/dto/pagination-query.dto.ts` (page?, limit?)
    - Create `CreateBankUseCase` — validates codigo and nome are non-empty, calls repository.create
    - Create `GetByIdBankUseCase` — calls repository.findById, throws 404 if not found
    - Create `FindAllBanksUseCase` — calls repository.findAll with pagination, returns data + meta (total, page, limit, totalPages)
    - Create `UpdateBankUseCase` — verifies bank exists (404), calls repository.update
    - Create `DeleteBankUseCase` — verifies bank exists (404), checks agency count via IBankAgencyRepository (409 if > 0), calls repository.delete
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_

  - [x] 1.3 Create Banks infrastructure repository and controller
    - Create `src/modules/finance/banks/src/infra/repository/bank.repository.ts` implementing IBankRepository with pg-promise SQL queries (INSERT, SELECT, UPDATE, DELETE on `banco` table)
    - Create `src/modules/finance/banks/src/presentation/controllers/banks.controller.ts` with POST, GET (list), GET :id, PUT :id, DELETE :id endpoints
    - _Requirements: 1.1, 1.3, 1.4, 1.6, 1.7_

  - [x] 1.4 Wire Banks module
    - Rewrite `src/modules/finance/banks/src/banks.module.ts` to import DatabaseModule, register all providers with DI token `'IBankRepository'`, export `'IBankRepository'`
    - _Requirements: 1.1_

  - [ ]* 1.5 Write unit tests for Banks use-cases
    - Create `src/modules/finance/banks/tests/unit/create-bank.use-case.spec.ts` — test success and 400 on missing fields
    - Create `src/modules/finance/banks/tests/unit/get-by-id-bank.use-case.spec.ts` — test success and 404
    - Create `src/modules/finance/banks/tests/unit/find-all-banks.use-case.spec.ts` — test pagination meta calculation
    - Create `src/modules/finance/banks/tests/unit/update-bank.use-case.spec.ts` — test success and 404
    - Create `src/modules/finance/banks/tests/unit/delete-bank.use-case.spec.ts` — test success, 404, and 409
    - _Requirements: 1.1, 1.2, 1.3, 1.5, 1.6, 1.7, 1.8_

  - [ ]* 1.6 Write property tests for Banks validation
    - **Property 2: Validação de campos obrigatórios rejeita dados incompletos de Banco**
    - **Validates: Requirements 1.2**
    - Create `src/modules/finance/banks/tests/property/bank-validation.property.spec.ts`
    - Generate random CreateBankDTO with missing/empty codigo or nome, verify HttpException 400

  - [ ]* 1.7 Write property test for pagination metadata consistency
    - **Property 3: Metadados de paginação são matematicamente consistentes**
    - **Validates: Requirements 1.3, 2.4, 3.5**
    - Add to `src/modules/finance/banks/tests/property/bank-validation.property.spec.ts`
    - Generate random total/page/limit values, verify totalPages === Math.ceil(total / limit) and data.length <= limit

- [x] 2. Checkpoint - Ensure Banks module compiles and tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Módulo Bank Agencies (domínio + aplicação)
  - [x] 3.1 Create Bank Agencies domain layer
    - Create `src/modules/finance/bank-agencies/src/domain/entity/bank-agency.entity.ts` with BankAgency class (id, bancoId, numero, digito, nome, contato?, gerente?, observacao?)
    - Create `src/modules/finance/bank-agencies/src/domain/repository/bank-agency.interface.repository.ts` with IBankAgencyRepository interface (create, findById, findAll, update, delete, countByBancoId)
    - Create `src/modules/finance/bank-agencies/src/domain/use-case/base.use-case.ts` with BaseUseCase<I, O> interface
    - _Requirements: 2.1, 2.4, 2.6, 2.8, 2.9, 2.10_

  - [x] 3.2 Create Bank Agencies DTOs and use-cases
    - Create `src/modules/finance/bank-agencies/src/application/dto/create-bank-agency.dto.ts` (bancoId, numero, digito, nome, contato?, gerente?, observacao?)
    - Create `src/modules/finance/bank-agencies/src/application/dto/update-bank-agency.dto.ts` (numero?, digito?, nome?, contato?, gerente?, observacao?)
    - Create `src/modules/finance/bank-agencies/src/application/dto/pagination-query.dto.ts` (page?, limit?, bancoId?)
    - Create `CreateBankAgencyUseCase` — validates required fields, verifies banco exists via IBankRepository (400 if not), calls repository.create
    - Create `GetByIdBankAgencyUseCase` — calls repository.findById, throws 404 if not found
    - Create `FindAllBankAgenciesUseCase` — calls repository.findAll with pagination and optional bancoId filter, returns data + meta
    - Create `UpdateBankAgencyUseCase` — verifies agency exists (404), calls repository.update
    - Create `DeleteBankAgencyUseCase` — verifies agency exists (404), checks account count via IBankAccountRepository (409 if > 0), calls repository.delete
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10_

  - [x] 3.3 Create Bank Agencies infrastructure repository and controller
    - Create `src/modules/finance/bank-agencies/src/infra/repository/bank-agency.repository.ts` implementing IBankAgencyRepository with pg-promise SQL queries on `banco_agencia` table
    - Create `src/modules/finance/bank-agencies/src/presentation/controllers/bank-agencies.controller.ts` with POST, GET (list with optional bancoId filter), GET :id, PUT :id, DELETE :id endpoints
    - _Requirements: 2.1, 2.4, 2.5, 2.6, 2.8, 2.9_

  - [x] 3.4 Wire Bank Agencies module
    - Create `src/modules/finance/bank-agencies/src/bank-agencies.module.ts` importing DatabaseModule and BanksModule, register all providers with DI token `'IBankAgencyRepository'`, export `'IBankAgencyRepository'`
    - _Requirements: 2.1_

  - [ ]* 3.5 Write unit tests for Bank Agencies use-cases
    - Create `src/modules/finance/bank-agencies/tests/unit/create-bank-agency.use-case.spec.ts` — test success, 400 on missing fields, 400 on non-existent banco
    - Create `src/modules/finance/bank-agencies/tests/unit/get-by-id-bank-agency.use-case.spec.ts` — test success and 404
    - Create `src/modules/finance/bank-agencies/tests/unit/find-all-bank-agencies.use-case.spec.ts` — test pagination and banco filter
    - Create `src/modules/finance/bank-agencies/tests/unit/update-bank-agency.use-case.spec.ts` — test success and 404
    - Create `src/modules/finance/bank-agencies/tests/unit/delete-bank-agency.use-case.spec.ts` — test success, 404, and 409
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.7, 2.8, 2.9, 2.10_

  - [ ]* 3.6 Write property tests for Bank Agencies validation
    - **Property 6: Validação de campos obrigatórios rejeita dados incompletos de Agência**
    - **Validates: Requirements 2.2**
    - Create `src/modules/finance/bank-agencies/tests/property/bank-agency-validation.property.spec.ts`
    - Generate random CreateBankAgencyDTO with missing/empty bancoId, numero, digito or nome, verify HttpException 400

  - [ ]* 3.7 Write property test for agency filter by banco
    - **Property 8: Filtro de agências por banco retorna apenas registros do banco especificado**
    - **Validates: Requirements 2.5**
    - Add to `src/modules/finance/bank-agencies/tests/property/bank-agency-validation.property.spec.ts`
    - Generate agencies across multiple bancos, filter by one bancoId, verify all results match

- [~] 4. Checkpoint - Ensure Bank Agencies module compiles and tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Módulo Bank Accounts (domínio + aplicação)
  - [x] 5.1 Create Bank Accounts domain layer
    - Create `src/modules/finance/bank-accounts/src/domain/entity/bank-account.entity.ts` with BankAccount class (id, bancoAgenciaId, numero, digito, nome, tipo, descricao?)
    - Create `src/modules/finance/bank-accounts/src/domain/repository/bank-account.interface.repository.ts` with IBankAccountRepository interface (create, findById, findAll, update, delete, countByAgenciaId)
    - Create `src/modules/finance/bank-accounts/src/domain/use-case/base.use-case.ts` with BaseUseCase<I, O> interface
    - _Requirements: 3.1, 3.5, 3.7, 3.9, 3.12_

  - [x] 5.2 Create Bank Accounts DTOs and use-cases
    - Create `src/modules/finance/bank-accounts/src/application/dto/create-bank-account.dto.ts` (bancoAgenciaId, numero, digito, nome, tipo, descricao?)
    - Create `src/modules/finance/bank-accounts/src/application/dto/update-bank-account.dto.ts` (numero?, digito?, nome?, tipo?, descricao?)
    - Create `src/modules/finance/bank-accounts/src/application/dto/pagination-query.dto.ts` (page?, limit?, bancoAgenciaId?)
    - Create `CreateBankAccountUseCase` — validates required fields, validates tipo ∈ {I, P, C}, verifies agência exists via IBankAgencyRepository (400 if not), calls repository.create
    - Create `GetByIdBankAccountUseCase` — calls repository.findById, throws 404 if not found
    - Create `FindAllBankAccountsUseCase` — calls repository.findAll with pagination and optional bancoAgenciaId filter, returns data + meta
    - Create `UpdateBankAccountUseCase` — verifies account exists (404), validates tipo if provided (400), calls repository.update
    - Create `DeleteBankAccountUseCase` — verifies account exists (404), calls repository.delete
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12_

  - [x] 5.3 Create Bank Accounts infrastructure repository and controller
    - Create `src/modules/finance/bank-accounts/src/infra/repository/bank-account.repository.ts` implementing IBankAccountRepository with pg-promise SQL queries on `banco_conta` table
    - Create `src/modules/finance/bank-accounts/src/presentation/controllers/bank-accounts.controller.ts` with POST, GET (list with optional bancoAgenciaId filter), GET :id, PUT :id, DELETE :id endpoints
    - _Requirements: 3.1, 3.5, 3.6, 3.7, 3.9, 3.12_

  - [x] 5.4 Wire Bank Accounts module and register BankAgenciesModule in app.module.ts
    - Rewrite `src/modules/finance/bank-accounts/src/bank-accounts.module.ts` importing DatabaseModule and BankAgenciesModule, register all providers with DI token `'IBankAccountRepository'`, export `'IBankAccountRepository'`
    - Update `src/app.module.ts` to import BankAgenciesModule
    - _Requirements: 3.1_

  - [ ]* 5.5 Write unit tests for Bank Accounts use-cases
    - Create `src/modules/finance/bank-accounts/tests/unit/create-bank-account.use-case.spec.ts` — test success, 400 on missing fields, 400 on invalid tipo, 400 on non-existent agência
    - Create `src/modules/finance/bank-accounts/tests/unit/get-by-id-bank-account.use-case.spec.ts` — test success and 404
    - Create `src/modules/finance/bank-accounts/tests/unit/find-all-bank-accounts.use-case.spec.ts` — test pagination and agência filter
    - Create `src/modules/finance/bank-accounts/tests/unit/update-bank-account.use-case.spec.ts` — test success, 404, and 400 on invalid tipo
    - Create `src/modules/finance/bank-accounts/tests/unit/delete-bank-account.use-case.spec.ts` — test success and 404
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.8, 3.9, 3.10, 3.11, 3.12_

  - [ ]* 5.6 Write property tests for Bank Accounts tipo validation
    - **Property 11: Validação de tipo de conta rejeita valores inválidos**
    - **Validates: Requirements 3.4, 3.11**
    - Create `src/modules/finance/bank-accounts/tests/property/bank-account-validation.property.spec.ts`
    - Generate random characters not in {I, P, C}, verify HttpException 400 on create and update

  - [ ]* 5.7 Write property test for account filter by agência
    - **Property 12: Filtro de contas por agência retorna apenas registros da agência especificada**
    - **Validates: Requirements 3.6**
    - Add to `src/modules/finance/bank-accounts/tests/property/bank-account-validation.property.spec.ts`
    - Generate accounts across multiple agências, filter by one agenciaId, verify all results match

  - [ ]* 5.8 Write property test for partial update consistency
    - **Property 13: Atualização reflete os campos informados**
    - **Validates: Requirements 1.6, 2.8, 3.9**
    - Add to `src/modules/finance/bank-accounts/tests/property/bank-account-validation.property.spec.ts`
    - Generate existing entity + partial update DTO, verify updated fields match new values and non-updated fields remain unchanged

- [~] 6. Final checkpoint - Ensure all modules compile and all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The `DeleteBankUseCase` needs `IBankAgencyRepository` injected (cross-module dependency via BanksModule importing nothing extra — the token is injected directly)
- The `DeleteBankAgencyUseCase` needs `IBankAccountRepository` injected (cross-module dependency)
- The existing stub modules (banks, bank-accounts) will be rewritten; bank-agencies is created from scratch
- `fast-check` is installed in task 1.1 and used across all property test files

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["1.4"] },
    { "id": 3, "tasks": ["1.5", "1.6", "1.7"] },
    { "id": 4, "tasks": ["3.1"] },
    { "id": 5, "tasks": ["3.2", "3.3"] },
    { "id": 6, "tasks": ["3.4"] },
    { "id": 7, "tasks": ["3.5", "3.6", "3.7"] },
    { "id": 8, "tasks": ["5.1"] },
    { "id": 9, "tasks": ["5.2", "5.3"] },
    { "id": 10, "tasks": ["5.4"] },
    { "id": 11, "tasks": ["5.5", "5.6", "5.7", "5.8"] }
  ]
}
```
