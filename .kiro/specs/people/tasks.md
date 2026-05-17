# People Module — Tasks

## Status Legend
- [ ] Pendente
- [x] Concluído
- [~] Em progresso

---

## Shared (person/shared)

- [x] Criar interfaces de repositório em `domain/repository/`
  - [x] `IPersonRepository`
  - [x] `IPersonFisicaRepository`
  - [x] `IPersonJuridicaRepository`
  - [x] `IContactRepository`
  - [x] `IAddressRepository`
- [x] Criar DTOs compartilhados em `dto/`
  - [x] `CreatePersonDTO`
  - [x] `FisicaDTO`
  - [x] `JuridicaDTO`
  - [x] `ContactDTO`
  - [x] `AddressDTO`
- [x] Implementar repositórios em `infra/repository/`
  - [x] `PersonRepository`
  - [x] `PersonFisicaRepository`
  - [x] `PersonJuridicaRepository`
  - [x] `ContactRepository`
  - [x] `AddressRepository`

## Employee (person/employee)

- [x] Criar entidades de domínio
  - [x] `Employee`
  - [x] `JobPosition`
  - [x] `Department`
  - [x] `SalesProfile`
- [x] Criar `IEmployeeRepository`
- [x] Criar `EmployeeDTO` e `CreateEmployeeDTO`
- [x] Implementar `CreateEmployeeUseCase` com transação
- [x] Implementar `GetByIdEmployeeUseCase` (stub)
- [x] Implementar `EmployeeRepository`
- [x] Criar `EmployeeController` (GET, GET/:id, POST, PUT)
- [x] Registrar `EmployeeModule`

## Client (person/client)

- [x] Criar `IClientRepository`
- [x] Criar `ClientDTO` e `CreateClientDTO`
- [x] Implementar `CreateClientUseCase` com transação
- [x] Implementar `GetByIdClientUseCase` (stub)
- [x] Implementar `ClientRepository`
- [x] Criar `ClientController`
- [x] Registrar `ClientModule`

## Supplier (person/supplier)

- [ ] Criar entidade `Supplier`
- [ ] Criar `ISupplierRepository`
- [ ] Criar `SupplierDTO` e `CreateSupplierDTO`
- [ ] Implementar `CreateSupplierUseCase` com transação
- [ ] Implementar `GetByIdSupplierUseCase`
- [ ] Implementar `SupplierRepository`
- [ ] Criar `SupplierController`
- [ ] Registrar `SupplierModule`

## Transporter (person/transporter)

- [ ] Criar entidade `Transporter`
- [ ] Criar `ITransporterRepository`
- [ ] Criar `TransporterDTO` e `CreateTransporterDTO`
- [ ] Implementar `CreateTransporterUseCase` com transação
- [ ] Implementar `GetByIdTransporterUseCase`
- [ ] Implementar `TransporterRepository`
- [ ] Criar `TransporterController`
- [ ] Registrar `TransporterModule`

## Salesperson (person/salesperson)

- [ ] Criar entidade `Salesperson` (colaborador_id, comissao, metaVenda)
- [ ] Criar `ISalespersonRepository`
- [ ] Criar `SalespersonDTO` e `CreateSalespersonDTO`
- [ ] Implementar `CreateSalespersonUseCase` (vincula a colaborador existente)
- [ ] Implementar `GetByIdSalespersonUseCase`
- [ ] Implementar `SalespersonRepository` (tabela `vendedor`)
- [ ] Criar `SalespersonController`
- [ ] Registrar `SalespersonModule`

## Pendências Gerais

- [ ] Adicionar validação de CPF/CNPJ nos DTOs
- [ ] Implementar `GetByIdEmployeeUseCase` com query real
- [ ] Implementar `GetByIdClientUseCase` com query real
- [ ] Adicionar `updated_at` nas tabelas que ainda não possuem
- [ ] Criar testes unitários para use cases
