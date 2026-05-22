# Implementation Plan: Installment Settlements

## Overview

Implementação do sistema de parcelamento de contas a pagar/receber com baixas financeiras por parcela. O plano modifica os módulos existentes `installments` e `financial-settlements` para suportar geração automática de parcelas, baixas vinculadas a parcelas (com juros, multa e desconto), atualização automática da conta-pai, pagamentos parciais e cancelamento de parcelas.

## Tasks

- [x] 1. Database migrations e schema changes
  - [x] 1.1 Criar migration para adicionar coluna `valor_pago` na tabela `parcelas`
    - Adicionar coluna `valor_pago NUMERIC(15, 2) NOT NULL DEFAULT 0` à tabela `parcelas`
    - Adicionar constraint `chk_valor_pago CHECK (valor_pago <= valor)`
    - _Requirements: 6.1, 6.3_

  - [x] 1.2 Criar migration para modificar tabela `baixas_financeiras`
    - Adicionar colunas: `parcela_id UUID`, `juros NUMERIC(15, 2) NOT NULL DEFAULT 0`, `multa NUMERIC(15, 2) NOT NULL DEFAULT 0`, `desconto NUMERIC(15, 2) NOT NULL DEFAULT 0`, `valor_liquido NUMERIC(15, 2)`
    - Remover coluna `conta_id`
    - Tornar `parcela_id` NOT NULL e adicionar FK para `parcelas(id)`
    - Tornar `valor_liquido` NOT NULL
    - Criar índice `idx_baixas_parcela_id ON baixas_financeiras(parcela_id)`
    - _Requirements: 7.1, 7.2, 2.3_

- [x] 2. Domain layer - Entidades e interfaces do módulo Installments
  - [x] 2.1 Atualizar entidade `Installment` com campo `valorPago`
    - Adicionar campo `valorPago: number` à classe `Installment` em `src/modules/finance/installments/src/domain/entity/installment.entity.ts`
    - Tipar o campo `status` como `'PENDENTE' | 'PARCIAL' | 'PAGO' | 'CANCELADO'`
    - _Requirements: 6.1, 6.2_

  - [x] 2.2 Estender interface `IInstallmentRepository`
    - Adicionar métodos: `createMany(data: any[], transaction?: any): Promise<Installment[]>`, `updateValorPago(id: string, valorPago: number, status: string, transaction?: any): Promise<Installment>`, `updateStatus(id: string, status: string, transaction?: any): Promise<Installment>`, `hasSettlements(origemId: string): Promise<boolean>`
    - Arquivo: `src/modules/finance/installments/src/domain/repository/installment.interface.repository.ts`
    - _Requirements: 1.7, 2.6, 8.1_

- [x] 3. Domain layer - Entidades e interfaces do módulo Financial Settlements
  - [x] 3.1 Atualizar entidade `FinancialSettlement`
    - Substituir campo `contaId` por `parcelaId: string`
    - Adicionar campos: `juros: number`, `multa: number`, `desconto: number`, `valorLiquido: number`
    - Arquivo: `src/modules/finance/financial-settlements/src/domain/entity/financial-settlement.entity.ts`
    - _Requirements: 7.1, 2.3_

  - [x] 3.2 Atualizar interface `IFinancialSettlementRepository`
    - Substituir método `findByContaId` por `findByParcelaId(parcelaId: string): Promise<FinancialSettlement[]>`
    - Adicionar método `existsByParcelaId(parcelaId: string): Promise<boolean>`
    - Arquivo: `src/modules/finance/financial-settlements/src/domain/repository/financial-settlement.interface.repository.ts`
    - _Requirements: 5.2, 7.4, 8.2_

- [x] 4. Infrastructure layer - Repository implementations
  - [x] 4.1 Atualizar `InstallmentRepository` com novos métodos
    - Implementar `createMany` usando batch insert com pg-promise
    - Implementar `updateValorPago` com UPDATE de valor_pago e status
    - Implementar `updateStatus` com UPDATE de status
    - Implementar `hasSettlements` com query JOIN entre parcelas e baixas_financeiras
    - Garantir que `findByOrigemId` retorna ordenado por `numero_parcela ASC`
    - Arquivo: `src/modules/finance/installments/src/infra/repository/installment.repository.ts`
    - _Requirements: 1.7, 2.6, 5.1, 8.2_

  - [x] 4.2 Atualizar `FinancialSettlementRepository` com novos métodos
    - Modificar `create` para usar `parcela_id` em vez de `conta_id`, incluir campos `juros`, `multa`, `desconto`, `valor_liquido`
    - Substituir `findByContaId` por `findByParcelaId` com ORDER BY `data_pagamento ASC`
    - Implementar `existsByParcelaId` com query EXISTS
    - Arquivo: `src/modules/finance/financial-settlements/src/infra/repository/financial-settlement.repository.ts`
    - _Requirements: 5.2, 5.4, 7.1_

- [x] 5. Checkpoint - Verificar camadas domain e infra
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Application layer - DTOs
  - [x] 6.1 Criar DTO `GenerateInstallmentsDTO`
    - Criar arquivo `src/modules/finance/installments/src/application/dto/generate-installments.dto.ts`
    - Campos: `tipoConta: 'PAGAR' | 'RECEBER'`, `contaId: string`, `quantidadeParcelas: number`, `intervaloMeses?: number`
    - Adicionar validações com class-validator (quantidadeParcelas >= 1, intervaloMeses >= 1)
    - _Requirements: 1.1, 1.5, 1.6_

  - [x] 6.2 Criar DTO `SettleInstallmentDTO`
    - Criar arquivo `src/modules/finance/financial-settlements/src/application/dto/settle-installment.dto.ts`
    - Campos: `parcelaId: string`, `tipoConta: 'PAGAR' | 'RECEBER'`, `valor: number`, `juros?: number`, `multa?: number`, `desconto?: number`, `dataPagamento: Date`, `formaPagamento: string`, `contaBancariaId?: string`, `caixaId?: string`, `observacao?: string`
    - Adicionar validações (valor > 0, juros/multa/desconto >= 0)
    - _Requirements: 2.2, 2.3_

  - [x] 6.3 Criar DTO `CancelInstallmentDTO`
    - Criar arquivo `src/modules/finance/installments/src/application/dto/cancel-installment.dto.ts`
    - Campo: `parcelaId: string`
    - _Requirements: 8.1_

- [x] 7. Application layer - Use Cases do módulo Installments
  - [x] 7.1 Implementar `GenerateInstallmentsUseCase`
    - Criar arquivo `src/modules/finance/installments/src/application/use-cases/generate-installments.use-case.ts`
    - Validar que conta existe (buscar via accountPayableRepository ou accountReceivableRepository)
    - Validar que quantidade de parcelas >= 1
    - Verificar se já existem parcelas com baixas vinculadas (rejeitar re-geração)
    - Calcular valor de cada parcela (distribuição proporcional, ajuste de centavos na última parcela)
    - Calcular datas de vencimento com intervalo mensal a partir da data de vencimento da conta
    - Criar parcelas via `createMany` dentro de transação
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [x]* 7.2 Write property test: geração preserva valor total
    - **Property 1: Installment generation preserves total value**
    - **Validates: Requirements 1.4**

  - [x]* 7.3 Write property test: estrutura correta de parcelas geradas
    - **Property 2: Installment generation produces correct structure**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.5**

  - [x] 7.4 Implementar `CancelInstallmentUseCase`
    - Criar arquivo `src/modules/finance/installments/src/application/use-cases/cancel-installment.use-case.ts`
    - Validar que parcela existe
    - Verificar se existem baixas vinculadas (rejeitar cancelamento se houver)
    - Atualizar status da parcela para CANCELADO
    - Recalcular status da conta-pai considerando apenas parcelas não canceladas
    - Executar dentro de transação
    - _Requirements: 8.1, 8.2, 8.3_

  - [x]* 7.5 Write property test: cancelamento válido/inválido
    - **Property 10: Cancellation of installment without settlements**
    - **Validates: Requirements 8.1, 8.2**

- [x] 8. Application layer - Use Cases do módulo Financial Settlements
  - [x] 8.1 Implementar `SettleInstallmentUseCase`
    - Criar arquivo `src/modules/finance/financial-settlements/src/application/use-cases/settle-installment.use-case.ts`
    - Validar que parcela existe e possui saldo pendente
    - Calcular valorLiquido = valor + juros + multa - desconto
    - Validar que valorLiquido não excede saldo restante (valor - valorPago)
    - Criar lançamento financeiro (financial entry) com valorLiquido
    - Criar registro de baixa com todos os campos (parcelaId, valor, juros, multa, desconto, valorLiquido)
    - Atualizar valorPago da parcela e derivar novo status (PARCIAL ou PAGO)
    - Buscar todas as parcelas da conta-pai e derivar status da conta
    - Atualizar valorPago e status da conta-pai
    - Toda operação dentro de `connection().tx()`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3_

  - [x]* 8.2 Write property test: cálculo de valor líquido
    - **Property 3: Valor líquido calculation**
    - **Validates: Requirements 2.2**

  - [x]* 8.3 Write property test: invariante de saldo
    - **Property 5: Balance constraint invariant**
    - **Validates: Requirements 2.5, 6.3**

  - [x]* 8.4 Write property test: derivação de status da parcela
    - **Property 6: Installment status derivation**
    - **Validates: Requirements 2.6, 4.1, 4.3**

  - [x]* 8.5 Write property test: derivação de status da conta-pai
    - **Property 7: Parent account status derivation**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 8.3**

  - [x]* 8.6 Write property test: valorPago equals sum of settlements
    - **Property 8: Installment valorPago equals sum of settlements**
    - **Validates: Requirements 6.1, 6.2**

  - [x] 8.7 Implementar `FindByParcelaIdSettlementUseCase`
    - Criar arquivo `src/modules/finance/financial-settlements/src/application/use-cases/find-by-parcela-id-financial-settlement.use-case.ts`
    - Buscar todas as baixas vinculadas a uma parcela via repository
    - Retornar lista ordenada por dataPagamento incluindo juros, multa e desconto
    - _Requirements: 5.2, 5.4_

- [x] 9. Checkpoint - Verificar use cases e lógica de negócio
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Presentation layer - Controllers
  - [x] 10.1 Atualizar `InstallmentController` com novos endpoints
    - Adicionar endpoint `POST /installments/generate` para `GenerateInstallmentsUseCase`
    - Adicionar endpoint `PATCH /installments/:id/cancel` para `CancelInstallmentUseCase`
    - Manter endpoints existentes (`GET /installments/:id`, `GET /installments?origemId=`)
    - Arquivo: `src/modules/finance/installments/src/presentation/controllers/installment.controller.ts`
    - _Requirements: 1.1, 5.1, 8.1_

  - [x] 10.2 Atualizar `FinancialSettlementController` com novos endpoints
    - Substituir endpoint `POST /financial-settlements` para usar `SettleInstallmentUseCase`
    - Substituir endpoint `GET /financial-settlements?contaId=` por `GET /financial-settlements?parcelaId=` usando `FindByParcelaIdSettlementUseCase`
    - Manter endpoint `GET /financial-settlements/:id`
    - Arquivo: `src/modules/finance/financial-settlements/src/presentation/controllers/financial-settlement.controller.ts`
    - _Requirements: 2.3, 5.2, 7.1_

- [x] 11. Module wiring - Atualizar NestJS modules
  - [x] 11.1 Atualizar `InstallmentsModule`
    - Registrar `GenerateInstallmentsUseCase` e `CancelInstallmentUseCase` como providers
    - Exportar os novos use cases
    - Importar `FinancialSettlementsModule` para acesso ao `existsByParcelaId`
    - Arquivo: `src/modules/finance/installments/src/installments.module.ts`
    - _Requirements: 1.1, 8.1_

  - [x] 11.2 Atualizar `FinancialSettlementsModule`
    - Registrar `SettleInstallmentUseCase` e `FindByParcelaIdSettlementUseCase` como providers
    - Remover `CreateFinancialSettlementUseCase` e `FindByContaIdFinancialSettlementUseCase` (substituídos)
    - Importar `InstallmentsModule` para acesso ao repository de parcelas
    - Exportar os novos use cases e `'IFinancialSettlementRepository'`
    - Arquivo: `src/modules/finance/financial-settlements/src/financial-settlements.module.ts`
    - _Requirements: 2.1, 5.2_

- [x] 12. Property-based tests complementares
  - [x]* 12.1 Write property test: settlement round-trip preserves data
    - **Property 4: Settlement round-trip preserves data**
    - **Validates: Requirements 2.3, 2.4**

  - [x]* 12.2 Write property test: ordenação de consulta de parcelas
    - **Property 9: Installment query ordering**
    - **Validates: Requirements 5.1**

- [x] 13. Unit tests
  - [x]* 13.1 Write unit tests para `GenerateInstallmentsUseCase`
    - Testar cenário de erro: conta não encontrada (404)
    - Testar cenário de erro: quantidade de parcelas < 1 (400)
    - Testar cenário de erro: re-geração com baixas existentes (400)
    - Testar edge case: arredondamento de centavos (ex: R$ 100,00 / 3 parcelas)
    - Testar campos opcionais: intervaloMeses default = 1
    - Arquivo: `src/modules/finance/installments/src/__tests__/generate-installments.use-case.spec.ts`
    - _Requirements: 1.4, 1.6, 1.7_

  - [x]* 13.2 Write unit tests para `SettleInstallmentUseCase`
    - Testar cenário de erro: parcela não encontrada (404)
    - Testar cenário de erro: valor líquido excede saldo (400)
    - Testar cenário de erro: parcela já quitada (400)
    - Testar cenário de erro: valores negativos em juros/multa/desconto (400)
    - Testar pagamento parcial atualiza status para PARCIAL
    - Testar pagamento total atualiza status para PAGO
    - Testar atualização da conta-pai quando todas parcelas pagas
    - Testar campos opcionais: contaBancariaId, caixaId, observacao como null
    - Arquivo: `src/modules/finance/financial-settlements/src/__tests__/settle-installment.use-case.spec.ts`
    - _Requirements: 2.1, 2.5, 2.6, 3.2, 4.1_

  - [x]* 13.3 Write unit tests para `CancelInstallmentUseCase`
    - Testar cenário de erro: parcela não encontrada (404)
    - Testar cenário de erro: parcela com baixas existentes (400)
    - Testar cancelamento atualiza status para CANCELADO
    - Testar recálculo de status da conta-pai após cancelamento
    - Arquivo: `src/modules/finance/installments/src/__tests__/cancel-installment.use-case.spec.ts`
    - _Requirements: 8.1, 8.2, 8.3_

- [x] 14. Final checkpoint - Verificação completa
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- O projeto usa TypeScript com NestJS, pg-promise para PostgreSQL, Jest + fast-check para testes
- A migração da tabela `baixas_financeiras` é breaking change: o campo `conta_id` será removido
- A lógica de derivação de status da conta-pai é centralizada no `SettleInstallmentUseCase` e `CancelInstallmentUseCase`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "2.2", "3.1", "3.2"] },
    { "id": 2, "tasks": ["4.1", "4.2", "6.1", "6.2", "6.3"] },
    { "id": 3, "tasks": ["7.1", "7.4", "8.1", "8.7"] },
    { "id": 4, "tasks": ["7.2", "7.3", "7.5", "8.2", "8.3", "8.4", "8.5", "8.6"] },
    { "id": 5, "tasks": ["10.1", "10.2"] },
    { "id": 6, "tasks": ["11.1", "11.2"] },
    { "id": 7, "tasks": ["12.1", "12.2", "13.1", "13.2", "13.3"] }
  ]
}
```
