# Implementation Plan

## Overview
Finalizar o módulo Employee implementando as funcionalidades pendentes: GetByIdEmployeeUseCase com query real, tabelas de cargos e departamentos, persistência de vendedor, integração RabbitMQ, campo updated_at, endpoint PUT real e testes unitários.

## Task Dependency Graph
```json
{
  "waves": [
    {"tasks": [1, 2, 5, 6]},
    {"tasks": [3]},
    {"tasks": [4, 7]},
    {"tasks": [8]}
  ]
}
```

## Tasks

- [x] 1. Implementar GetByIdEmployeeUseCase com query real no banco
  - [x] 1.1. Atualizar `src/modules/person/employee/src/domain/repository/enployee.interface.repository.ts` adicionando método `findById(id: string): Promise<any>`
  - [x] 1.2. Atualizar `src/modules/person/employee/src/infra/repository/enployee.repository.ts` implementando `findById` com SELECT + JOIN em pessoa, cargo e departamento
  - [x] 1.3. Atualizar `src/modules/person/employee/src/application/use-cases/get-by-id-employee.use-case.ts` injetando IEmployeeRepository e chamando `findById`, lançando NotFoundException se não encontrado
  - [x] 1.4. Atualizar `src/modules/person/employee/src/presentation/controllers/employee.controller.ts` no endpoint `GET :id` para receber `@Param('id')` e passar ao use case

- [x] 2. Criar tabelas cargos e departamentos no schema
  - [x] 2.1. Criar `src/modules/person/employee/src/infra/migrations/001-create-cargo-departamento.sql` com CREATE TABLE cargo (id UUID PK DEFAULT gen_random_uuid(), nome VARCHAR NOT NULL, salario DECIMAL NOT NULL) e CREATE TABLE departamento (id UUID PK DEFAULT gen_random_uuid(), nome VARCHAR NOT NULL)
  - [x] 2.2. Adicionar no mesmo arquivo ALTER TABLE colaborador ADD COLUMN cargo_id UUID REFERENCES cargo(id), ADD COLUMN departamento_id UUID REFERENCES departamento(id)

- [ ] 3. Persistir cargo e departamento no banco durante criação
  - [ ] 3.1. Criar `src/modules/person/employee/src/domain/repository/job-position.interface.repository.ts` com interface IJobPositionRepository { create(data: any, transaction?: any): Promise<any> }
  - [ ] 3.2. Criar `src/modules/person/employee/src/domain/repository/department.interface.repository.ts` com interface IDepartmentRepository { create(data: any, transaction?: any): Promise<any> }
  - [ ] 3.3. Criar `src/modules/person/employee/src/infra/repository/job-position.repository.ts` com INSERT em cargo (nome, salario) RETURNING *
  - [ ] 3.4. Criar `src/modules/person/employee/src/infra/repository/department.repository.ts` com INSERT em departamento (nome) RETURNING *
  - [ ] 3.5. Atualizar `src/modules/person/employee/src/application/use-cases/create-employee.use-case.ts` injetando IJobPositionRepository e IDepartmentRepository, inserindo cargo e departamento na transação e usando os IDs retornados no INSERT do colaborador
  - [ ] 3.6. Atualizar `src/modules/person/employee/src/infra/repository/enployee.repository.ts` para incluir cargo_id e departamento_id no INSERT
  - [ ] 3.7. Registrar os novos providers no `src/modules/person/employee/src/employee.module.ts`

- [ ] 4. Persistir vendedor na tabela vendedor durante criação
  - [ ] 4.1. Criar `src/modules/person/employee/src/domain/repository/sales-profile.interface.repository.ts` com interface ISalesProfileRepository { create(data: any, transaction?: any): Promise<any> }
  - [ ] 4.2. Criar `src/modules/person/employee/src/infra/repository/sales-profile.repository.ts` com INSERT em vendedor (colaborador_id, comissao, meta_venda) RETURNING *
  - [ ] 4.3. Atualizar `src/modules/person/employee/src/application/use-cases/create-employee.use-case.ts` injetando ISalesProfileRepository e, se `data.colaborador.vendedor` existir, inserir na tabela vendedor com o colaborador_id retornado
  - [ ] 4.4. Registrar ISalesProfileRepository e SalesProfileRepository no `src/modules/person/employee/src/employee.module.ts`

- [ ] 5. Integrar publicação de evento RabbitMQ para createUser = true
  - [ ] 5.1. Atualizar `src/modules/person/employee/src/employee.module.ts` importando RabbitMQModule de `src/infra/queue/queue.module`
  - [ ] 5.2. Atualizar `src/modules/person/employee/src/application/use-cases/create-employee.use-case.ts` descomentando e implementando a injeção de RABBIT_MQ (RabbitMQMananger) e a publicação no exchange `employee_exchange` com routing key `employee.created` contendo { id, personId, nome, email }

- [ ] 6. Adicionar updated_at na tabela colaborador
  - [ ] 6.1. Criar `src/modules/person/employee/src/infra/migrations/002-add-updated-at-colaborador.sql` com ALTER TABLE colaborador ADD COLUMN updated_at TIMESTAMP DEFAULT NOW()
  - [ ] 6.2. Atualizar `src/modules/person/employee/src/domain/entity/employee.entity.ts` adicionando campo `updatedAt?: Date`

- [ ] 7. Implementar endpoint PUT com update real
  - [ ] 7.1. Criar `src/modules/person/employee/src/application/dto/update-employee.dto.ts` com campos opcionais (matricula, dataAdmissao, dataDemissao, cargo, departamento)
  - [ ] 7.2. Atualizar `src/modules/person/employee/src/domain/repository/enployee.interface.repository.ts` adicionando método `update(id: string, data: any, transaction?: any): Promise<any>`
  - [ ] 7.3. Atualizar `src/modules/person/employee/src/infra/repository/enployee.repository.ts` implementando `update` com UPDATE em colaborador SET matricula, cargo_id, departamento_id, demissao, updated_at WHERE id
  - [ ] 7.4. Criar `src/modules/person/employee/src/application/use-cases/update-employee.use-case.ts` injetando IEmployeeRepository, IJobPositionRepository e IDepartmentRepository, atualizando cargo/departamento se informados e depois o colaborador
  - [ ] 7.5. Atualizar `src/modules/person/employee/src/presentation/controllers/employee.controller.ts` no endpoint PUT para receber `@Param('id')` e `@Body()` UpdateEmployeeDTO
  - [ ] 7.6. Registrar UpdateEmployeeUseCase no `src/modules/person/employee/src/employee.module.ts`

- [ ] 8. Criar testes unitários para CreateEmployeeUseCase
  - [ ] 8.1. Criar `src/modules/person/employee/tests/create-employee.use-case.spec.ts` com mocks de todos os repositórios e conexão
  - [ ] 8.2. Testar cenário de sucesso com pessoa física (tipo = 'F') e cargo/departamento
  - [ ] 8.3. Testar cenário de sucesso com pessoa jurídica (tipo = 'J')
  - [ ] 8.4. Testar cenário com vendedor (verifica insert na tabela vendedor)
  - [ ] 8.5. Testar cenário com createUser = true (verifica publish no RabbitMQ)
  - [ ] 8.6. Testar cenário de falha na transação (verifica que erro é propagado)

## Notes
- O módulo já tem a estrutura base implementada (entities, DTOs, controller, module, repository básico)
- Seguir o padrão existente de injeção de dependência com tokens string (ex: 'IEmployeeRepository')
- Usar pg-promise para queries SQL
- Manter consistência com o módulo client que segue o mesmo padrão
- Nota: os arquivos de repositório têm typo no nome (enployee ao invés de employee) - manter o nome existente para não quebrar imports
