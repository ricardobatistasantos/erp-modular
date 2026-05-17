# People Module — Requirements

## Overview

O módulo `person` é o núcleo de cadastro de pessoas do ERP. Toda entidade que representa um agente (cliente, colaborador, fornecedor, transportadora) é derivada de uma `Pessoa` base. O módulo é dividido em um contexto compartilhado (`shared`) e subcontextos específicos por papel.

## Glossary

| Termo | Definição |
|---|---|
| Pessoa | Entidade base com dados comuns a qualquer agente (nome, email, tipo, endereços, contatos) |
| Pessoa Física | Extensão de Pessoa com CPF |
| Pessoa Jurídica | Extensão de Pessoa com CNPJ |
| Colaborador | Pessoa com vínculo empregatício (matrícula, admissão, demissão) |
| Cliente | Pessoa com dados comerciais (taxa de desconto, limite de crédito) |
| Fornecedor | Pessoa que fornece produtos/serviços |
| Transportadora | Pessoa que presta serviço de transporte |
| Vendedor | Colaborador com perfil de vendas (comissão, meta) |

## Submodules

- `person/shared` — entidades, repositórios e DTOs compartilhados
- `person/employee` — módulo de colaboradores
- `person/client` — módulo de clientes
- `person/supplier` — módulo de fornecedores
- `person/transporter` — módulo de transportadoras

## Shared Domain

### Aggregate Root: Person

```
Person
  ├── id: UUID (PK)
  ├── nome: string
  ├── email: string (unique)
  ├── tipo: 'F' | 'J'
  ├── colaborador: int (flag)
  ├── cliente: int (flag)
  ├── transportadora: int (flag)
  ├── observacao?: string
  ├── createdAt: timestamp
  └── updatedAt: timestamp

PersonFisica
  ├── id: UUID (PK)
  ├── pessoaId: UUID (FK → pessoa)
  └── cpf: string (unique)

PersonJuridica
  ├── id: UUID (PK)
  ├── pessoaId: UUID (FK → pessoa)
  └── cnpj: string (unique)

PersonContato
  ├── id: UUID (PK)
  ├── pessoaId: UUID (FK → pessoa)
  ├── tipo: 'PESSOAL' | 'TRABALHO'
  └── telefone: string

PersonEndereco
  ├── id: UUID (PK)
  ├── pessoaId: UUID (FK → pessoa)
  ├── logradouro, numero, bairro, cidade, uf, cep
  └── tipoEndereco: 'RESIDENCIAL' | 'TRABALHO'
```

### Shared Repositories (interfaces in domain)

- `IPersonRepository` — create
- `IPersonFisicaRepository` — create
- `IPersonJuridicaRepository` — create
- `IContactRepository` — create
- `IAddressRepository` — create

### Shared DTOs

- `CreatePersonDTO` — nome, email, tipo, fisica?, juridica?, contatos?, enderecos?, observacao?
- `FisicaDTO` — cpf
- `JuridicaDTO` — cnpj
- `ContactDTO` — tipo, telefone
- `AddressDTO` — logradouro, numero, bairro, cidade, uf, cep, tipoEndereco

## Rules

- Toda criação de pessoa e seus dados relacionados deve ocorrer dentro de uma transação pg-promise
- UUID como PK em todas as tabelas
- `created_at` e `updated_at` obrigatórios em `pessoa`
- CPF único por pessoa física; CNPJ único por pessoa jurídica
- Email único por pessoa
