# Implementation Plan: Update Employee

## Overview

Implementação da funcionalidade de atualização de colaborador seguindo o padrão transacional do `UpdateClientUseCase`. A implementação é incremental: primeiro as interfaces e repositórios, depois o DTO, o use case, e por fim a integração no controller e módulo NestJS.

## Tasks

- [x] 1. Atualizar interfaces de repositório e criar interface do SalesProfileRepository
  - [x] 1.1 Adicionar método `update` na interface IEmployeeRepository
    - Adicionar `update(id: string, data: any, transaction?: any): Promise<any>` na interface `IEmployeeRepository` em `src/modules/person/employee/src/domain/repository/enployee.interface.repository.ts`
    - _Requirements: 10.3_

  - [x] 1.2 Adicionar método `update` na interface IJobPositionRepository
    - Adicionar `update(id: string, data: any, transaction?: any): Promise<any>` na interface `IJobPositionRepository` em `src/modules/person/employee/src/domain/repository/job-position.interface.repository.ts`
    - _Requirements: 7.2, 7.5_

  - [x] 1.3 Adicionar método `update` na interface IDepartmentRepository
    - Adicionar `update(id: string, data: any, transaction?: any): Promise<any>` na interface `IDepartmentRepository` em `src/modules/person/employee/src/domain/repository/department.interface.repository.ts`
    - _Requirements: 7.3, 7.6_

  - [x] 1.4 Criar interface ISalesProfileRepository
    - Criar arquivo `src/modules/person/employee/src/domain/repository/sales-profile.interface.repository.ts` com os métodos: `create(data: any, transaction?: any): Promise<any>`, `update(colaboradorId: string, data: any, transaction?: any): Promise<any>`, `findByColaboradorId(colaboradorId: string, transaction?: any): Promise<any | null>`
    - _Requirements: 8.1, 8.2, 8.3_

- [x] 2. Implementar métodos de repositório
  - [x] 2.1 Implementar método `update` no EmployeeRepository
    - Adicionar método `update` em `src/modules/person/employee/src/infra/repository/enployee.repository.ts` com query SQL usando COALESCE para atualizar matricula, cargo_id e departamento_id na tabela `colaborador`
    - _Requirements: 7.1, 10.3_

  - [x] 2.2 Implementar método `update` no JobPositionRepository
    - Adicionar método `update` em `src/modules/person/employee/src/infra/repository/job-position.repository.ts` com query SQL usando COALESCE para atualizar nome e salario na tabela `cargo`
    - _Requirements: 7.2, 7.5_

  - [x] 2.3 Implementar método `update` no DepartmentRepository
    - Adicionar método `update` em `src/modules/person/employee/src/infra/repository/department.repository.ts` com query SQL usando COALESCE para atualizar nome na tabela `departamento`
    - _Requirements: 7.3, 7.6_

  - [x] 2.4 Criar SalesProfileRepository
    - Criar arquivo `src/modules/person/employee/src/infra/repository/sales-profile.repository.ts` implementando `ISalesProfileRepository` com métodos `create` (INSERT INTO vendedor), `update` (UPDATE vendedor WHERE colaborador_id), e `findByColaboradorId` (SELECT FROM vendedor WHERE colaborador_id)
    - _Requirements: 8.1, 8.2, 8.3, 8.5_

- [x] 3. Criar UpdateEmployeeDTO
  - [x] 3.1 Criar o DTO de atualização do colaborador
    - Criar arquivo `src/modules/person/employee/src/application/dto/update-employee.dto.ts` com a classe `UpdateEmployeeDTO` contendo campos opcionais `pessoa` (nome, email, observacao, tipo, fisica, juridica, contatos, enderecos) e `colaborador` (matricula, dataAdmissao, dataDemissao, cargo, departamento, vendedor), seguindo o padrão do `UpdateClientDTO`
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 4. Implementar UpdateEmployeeUseCase
  - [ ] 4.1 Criar o use case de atualização do colaborador
    - Criar arquivo `src/modules/person/employee/src/application/use-cases/update-employee.use-case.ts` implementando `BaseUseCase<any, any>` com injeção de todos os repositórios necessários (IPersonRepository, IPersonFisicaRepository, IPersonJuridicaRepository, IContactRepository, IAddressRepository, IEmployeeRepository, IJobPositionRepository, IDepartmentRepository, ISalesProfileRepository)
    - Implementar método `execute` com: validação de existência do colaborador via findById, extração do pessoa_id, encapsulamento de todas as operações em `connection().tx()`, atualização condicional de pessoa/fisica/juridica, substituição de contatos/endereços, atualização condicional de colaborador com lógica de upsert para cargo/departamento/vendedor, e retorno via findById pós-commit
    - _Requirements: 1.1, 2.1, 2.2, 2.3, 3.1, 3.2, 3.4, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 6.1, 6.2, 6.3, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 8.1, 8.2, 8.3, 11.1, 11.2_

  - [ ]* 4.2 Escrever teste de propriedade para despacho condicional de operações
    - **Property 1: Despacho condicional de operações baseado na estrutura do DTO**
    - **Validates: Requirements 4.1, 4.4, 7.1, 7.4, 9.3**

  - [ ]* 4.3 Escrever teste de propriedade para semântica de substituição de arrays
    - **Property 2: Semântica de substituição de arrays (contatos e endereços)**
    - **Validates: Requirements 5.1, 5.2, 5.3, 6.1, 6.2, 6.3**

  - [ ]* 4.4 Escrever teste de propriedade para lógica de upsert
    - **Property 3: Lógica de upsert para cargo, departamento e vendedor**
    - **Validates: Requirements 7.2, 7.3, 7.5, 7.6, 8.1, 8.2**

- [ ] 5. Checkpoint - Verificar repositórios e use case
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Integrar no Controller e Módulo
  - [ ] 6.1 Atualizar o EmployeeController com o endpoint PUT
    - Modificar `src/modules/person/employee/src/presentation/controllers/employee.controller.ts`: importar `UpdateEmployeeUseCase` e `UpdateEmployeeDTO`, adicionar `updateEmployeeUseCase` no constructor, atualizar o método `@Put(':id')` existente para receber `@Param('id') id: string` e `@Body() updateEmployeeDto: UpdateEmployeeDTO`, delegando para `this.updateEmployeeUseCase.execute({ id, updateData: updateEmployeeDto })`
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ] 6.2 Registrar UpdateEmployeeUseCase e SalesProfileRepository no módulo
    - Modificar `src/modules/person/employee/src/employee.module.ts`: importar `UpdateEmployeeUseCase` e `SalesProfileRepository`, adicionar provider `{ provide: 'ISalesProfileRepository', useClass: SalesProfileRepository }`, e adicionar `UpdateEmployeeUseCase` no array de providers
    - _Requirements: 10.1, 10.2, 10.4_

- [ ] 7. Testes de validação e propriedades adicionais
  - [ ]* 7.1 Escrever teste de propriedade para validação do DTO
    - **Property 4: Validação do DTO rejeita dados inválidos**
    - **Validates: Requirements 4.7, 8.4, 9.1, 9.2, 9.5**

  - [ ]* 7.2 Escrever teste de propriedade para exclusão mútua tipo/fisica/juridica
    - **Property 5: Exclusão mútua entre pessoa física e jurídica**
    - **Validates: Requirements 4.2, 4.3, 4.6, 9.4**

  - [ ]* 7.3 Escrever testes unitários do UpdateEmployeeUseCase
    - Testar cenários: colaborador não encontrado (NotFoundException), atualização completa com todos os campos, atualização parcial apenas pessoa, atualização parcial apenas colaborador, matrícula duplicada, ID vazio/nulo
    - _Requirements: 2.1, 2.2, 2.4, 3.1, 3.2, 3.3, 7.7, 11.3_

  - [ ]* 7.4 Escrever testes unitários do EmployeeController
    - Testar cenários: retorno 200 com sucesso, retorno 404 com NotFoundException, retorno 400 com corpo inválido
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 8. Final checkpoint - Verificar integração completa
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marcadas com `*` são opcionais e podem ser puladas para um MVP mais rápido
- Cada task referencia requisitos específicos para rastreabilidade
- Checkpoints garantem validação incremental
- Testes de propriedade validam propriedades universais de corretude definidas no design
- Testes unitários validam exemplos específicos e edge cases
- O padrão segue exatamente o `UpdateClientUseCase` já implementado no módulo de cliente
- A linguagem de implementação é TypeScript (conforme o design e o projeto existente)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3", "1.4"] },
    { "id": 1, "tasks": ["2.1", "2.2", "2.3", "2.4", "3.1"] },
    { "id": 2, "tasks": ["4.1"] },
    { "id": 3, "tasks": ["4.2", "4.3", "4.4"] },
    { "id": 4, "tasks": ["6.1", "6.2"] },
    { "id": 5, "tasks": ["7.1", "7.2", "7.3", "7.4"] }
  ]
}
```
