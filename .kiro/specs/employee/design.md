# Employee Module — Design

## Module Structure

```
src/modules/person/employee/src/
  ├── domain/
  │   ├── entity/
  │   │   ├── employee.entity.ts       ← id, personId, matricula, dataAdmissao, dataDemissao, cargo, departamento, vendedor?
  │   │   ├── jobPosition.entity.ts    ← nome, salario
  │   │   ├── department.entity.ts     ← nome
  │   │   └── salesProfile.entity.ts  ← comissao, metaVendas
  │   ├── repository/
  │   │   └── employee.interface.repository.ts  ← IEmployeeRepository
  │   └── use-case/
  │       └── base.use-case.ts
  │
  ├── application/
  │   ├── dto/
  │   │   ├── employee.dto.ts          ← EmployeeDTO
  │   │   └── create-employee.dto.ts  ← CreateEmployeeDTO
  │   └── use-cases/
  │       ├── create-employee.use-case.ts
  │       └── get-by-id-employee.use-case.ts
  │
  ├── infra/
  │   └── repository/
  │       └── employee.repository.ts  ← EmployeeRepository (pg-promise)
  │
  ├── presentation/
  │   └── controllers/
  │       └── employee.controller.ts
  │
  └── employee.module.ts
```

## Domain Entities

```typescript
class Employee {
  id?: string;
  personId: string;
  matricula: string;
  dataAdmissao: Date;
  dataDemissao?: Date;
  cargo: JobPosition;
  departamento: Department;
  vendedor?: SalesProfile;
}

class JobPosition { nome: string; salario: number; }
class Department   { nome: string; }
class SalesProfile { comissao: number; metaVendas: number; }
```

## Use Case: CreateEmployeeUseCase

Fluxo dentro de uma transação pg-promise:

```
1. personRepository.create({ colaborador: 1, ...pessoa })
2. if tipo='F' → personFisicaRepository.create({ pessoaId, ...fisica })
3. if tipo='J' → personJuridicaRepository.create({ pessoaId, ...juridica })
4. Promise.all(contatos.map → contactRepository.create)
5. Promise.all(enderecos.map → addressRepository.create)
6. employeeRepository.create({ pessoaId, ...colaborador })
7. if createUser → publish event to queue
```

## Repository: EmployeeRepository

Tabela: `colaborador`

```sql
INSERT INTO colaborador (pessoa_id, matricula) VALUES ($1, $2) RETURNING *
```

> Nota: `cargo` e `departamento` ainda não possuem tabelas próprias no schema atual. Os campos são armazenados no DTO mas não persistidos separadamente. Pendência: criar tabelas `cargos` e `departamentos`.

## Module Registration

```typescript
@Module({
  providers: [
    { provide: 'IEmployeeRepository', useClass: EmployeeRepository },
    { provide: 'IPersonRepository',   useClass: PersonRepository },
    { provide: 'IPersonFisicaRepository', useClass: PersonFisicaRepository },
    { provide: 'IPersonJuridicaRepository', useClass: PersonJuridicaRepository },
    { provide: 'IContactRepository',  useClass: ContactRepository },
    { provide: 'IAddressRepository',  useClass: AddressRepository },
    CreateEmployeeUseCase,
    GetByIdEmployeeUseCase,
  ],
  controllers: [EmployeeController],
})
export class EmployeeModule {}
```

## API Endpoints

| Method | Path | Use Case |
|---|---|---|
| POST | /employee | CreateEmployeeUseCase |
| GET | /employee | findAll (stub) |
| GET | /employee/:id | GetByIdEmployeeUseCase |
| PUT | /employee | updateEmployee (stub) |

## Pending

- [ ] Implementar `GetByIdEmployeeUseCase` com query real
- [ ] Criar tabelas `cargos` e `departamentos` e persistir os dados
- [ ] Integrar publicação de evento RabbitMQ quando `createUser = true`
- [ ] Adicionar `updated_at` na tabela `colaborador`
