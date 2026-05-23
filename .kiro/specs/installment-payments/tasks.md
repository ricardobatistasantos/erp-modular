# Implementation Plan: Parcelamento Integrado (Installment Payments)

## Overview

Implementação da integração nativa de parcelamentos nos módulos de Contas a Pagar e Contas a Receber. O plano segue a arquitetura limpa existente (domain/application/infra/presentation) e adiciona: Domain Service de cálculo, validações de integridade, novos use cases (recalculação e regeneração), extensão dos DTOs e repositórios, e consulta com resumo de parcelamento.

## Tasks

- [x] 1. Criar Domain Service e Validações de Parcelamento
  - [x] 1.1 Criar o InstallmentCalculator (Domain Service)
    - Criar arquivo `src/modules/finance/installments/src/domain/services/installment-calculator.ts`
    - Implementar interface `InstallmentCalculationInput` e `InstallmentCalculationOutput`
    - Implementar método `calculate()` com distribuição proporcional (truncar em 2 casas, resíduo na última parcela)
    - Implementar método `calculate()` com distribuição personalizada (valores informados)
    - Implementar método `recalculate()` para redistribuir valor restante entre parcelas pendentes
    - Implementar cálculo de datas com adição de meses respeitando último dia do mês (ex: 31/01 + 1 mês = 28/02)
    - _Requisitos: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.3_

  - [ ]* 1.2 Escrever teste de propriedade para distribuição proporcional (Property 1)
    - **Property 1: Invariante de soma — Distribuição proporcional preserva valor total**
    - **Valida: Requisitos 3.3, 3.1, 3.2, 1.4, 2.4, 8.1**
    - Arquivo: `installments/src/__tests__/proportional-distribution.property.spec.ts`

  - [ ]* 1.3 Escrever teste de propriedade para distribuição personalizada (Property 2)
    - **Property 2: Distribuição personalizada preserva valores posicionais**
    - **Valida: Requisitos 1.5, 2.5, 4.1**
    - Arquivo: `installments/src/__tests__/custom-distribution.property.spec.ts`

  - [ ]* 1.4 Escrever teste de propriedade para espaçamento de datas (Property 4)
    - **Property 4: Espaçamento de datas respeita último dia do mês**
    - **Valida: Requisitos 3.5, 4.3**
    - Arquivo: `installments/src/__tests__/date-spacing.property.spec.ts`

  - [ ]* 1.5 Escrever teste de propriedade para datas personalizadas (Property 5)
    - **Property 5: Correspondência posicional de datas personalizadas**
    - **Valida: Requisitos 4.2**
    - Arquivo: `installments/src/__tests__/custom-dates.property.spec.ts`

  - [x] 1.6 Criar o InstallmentValidation (Domain Validation)
    - Criar arquivo `src/modules/finance/installments/src/domain/validation/installment-validation.ts`
    - Implementar `validateCreation()`: validar quantidadeParcelas (1-360), valor > 0, soma de valores == total, length de valores == quantidade, length de datasVencimento == quantidade, valores individuais > 0, datas >= data emissão, valor/quantidade >= 0.01
    - Implementar `validateIntegrity()`: validar soma das parcelas ativas == valor total pós-operação
    - Lançar HttpException com mensagens descritivas conforme tabela de erros do design
    - _Requisitos: 1.3, 1.6, 1.7, 1.8, 2.3, 2.6, 2.7, 2.8, 4.4, 4.5, 4.6, 8.1, 8.2_

  - [ ]* 1.7 Escrever teste de propriedade para rejeição de soma divergente (Property 3)
    - **Property 3: Rejeição de soma divergente**
    - **Valida: Requisitos 1.6, 2.6**
    - Arquivo: `installments/src/__tests__/sum-validation.property.spec.ts`

  - [ ]* 1.8 Escrever testes unitários para InstallmentValidation
    - Testar cenários de borda: valores negativos, quantidades inválidas, datas anteriores à emissão
    - Arquivo: `installments/src/__tests__/installment-validation.spec.ts`
    - _Requisitos: 1.3, 1.6, 1.7, 1.8, 4.4, 4.5, 4.6_

- [x] 2. Checkpoint - Verificar testes do Domain Service
  - Garantir que todos os testes passam, perguntar ao usuário se houver dúvidas.

- [x] 3. Estender Repositório e DTOs
  - [x] 3.1 Estender IInstallmentRepository com novos métodos
    - Adicionar ao arquivo `src/modules/finance/installments/src/domain/repository/installment.interface.repository.ts`:
    - `updateValor(id, valor, transaction?)`: atualizar valor de uma parcela
    - `cancelMany(ids[], transaction?)`: cancelar múltiplas parcelas
    - `findPendingByOrigemId(origemId)`: buscar parcelas PENDENTE por origemId
    - `getMaxNumeroParcela(origemId)`: obter maior número de parcela existente
    - `hasSettlementsByParcelaIds(parcelaIds[])`: verificar se existem baixas vinculadas a parcelas específicas
    - _Requisitos: 5.1, 5.2, 6.1, 6.3, 8.3_

  - [x] 3.2 Implementar novos métodos no InstallmentRepository (infra)
    - Atualizar arquivo `src/modules/finance/installments/src/infra/repository/installment.repository.ts`
    - Implementar queries SQL para cada novo método da interface
    - _Requisitos: 5.1, 5.2, 6.1, 6.3, 8.3_

  - [x] 3.3 Criar ParcelamentoDTO e estender DTOs de criação de conta
    - Criar `src/modules/finance/installments/src/application/dto/parcelamento.dto.ts` com campos: quantidadeParcelas, intervaloMeses?, valores?, datasVencimento?
    - Estender `CreateAccountPayableDTO` com campo opcional `parcelamento?: ParcelamentoDTO`
    - Estender `CreateAccountReceivableDTO` com campo opcional `parcelamento?: ParcelamentoDTO`
    - _Requisitos: 1.1, 1.4, 1.5, 2.1, 2.4, 2.5_

  - [x] 3.4 Criar DTOs para recalculação e regeneração
    - Criar `src/modules/finance/installments/src/application/dto/recalculate-installments.dto.ts` com campos: contaId, tipoConta, novoValorTotal
    - Criar `src/modules/finance/installments/src/application/dto/regenerate-installments.dto.ts` com campos: contaId, tipoConta, quantidadeParcelas, intervaloMeses?, valores?, datasVencimento?
    - _Requisitos: 5.1, 6.1_

- [x] 4. Refatorar Use Cases de Criação de Conta
  - [x] 4.1 Refatorar CreateAccountPayableUseCase com parcelamento integrado
    - Atualizar `src/modules/finance/accounts-payable/src/application/use-cases/create-account-payable.use-case.ts`
    - Injetar `IInstallmentRepository`, `InstallmentCalculator`, `InstallmentValidation` e `DATABASE_CONNECTION`
    - Quando `parcelamento` informado: validar com `InstallmentValidation`, criar conta em transação, calcular parcelas com `InstallmentCalculator`, criar parcelas com `createMany`
    - Quando `parcelamento` não informado: criar conta em transação e gerar parcela única (valor total, mesma data de vencimento, numeroParcela=1)
    - Validar integridade pós-criação com `validateIntegrity()`
    - _Requisitos: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 8.1, 8.2, 8.3_

  - [x] 4.2 Refatorar CreateAccountReceivableUseCase com parcelamento integrado
    - Atualizar `src/modules/finance/accounts-receivable/src/application/use-cases/create-account-receivable.use-case.ts`
    - Mesma lógica do 4.1 adaptada para contas a receber
    - _Requisitos: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 8.1, 8.2, 8.3_

  - [ ]* 4.3 Escrever testes unitários para criação com parcelamento (Contas a Pagar)
    - Testar criação sem parcelamento gera parcela única
    - Testar criação com distribuição proporcional
    - Testar criação com distribuição personalizada
    - Testar rejeição de validações
    - Arquivo: `accounts-payable/tests/unit/create-with-installments.spec.ts`
    - _Requisitos: 1.1, 1.2, 1.4, 1.5_

  - [ ]* 4.4 Escrever testes unitários para criação com parcelamento (Contas a Receber)
    - Testar criação sem parcelamento gera parcela única
    - Testar criação com distribuição proporcional
    - Testar criação com distribuição personalizada
    - Arquivo: `accounts-receivable/tests/unit/create-with-installments.spec.ts`
    - _Requisitos: 2.1, 2.2, 2.4, 2.5_

- [x] 5. Checkpoint - Verificar criação com parcelamento
  - Garantir que todos os testes passam, perguntar ao usuário se houver dúvidas.

- [x] 6. Implementar Recalculação de Parcelas
  - [x] 6.1 Criar RecalculateInstallmentsUseCase
    - Criar arquivo `src/modules/finance/installments/src/application/use-cases/recalculate-installments.use-case.ts`
    - Buscar conta por ID (pagar ou receber conforme tipoConta)
    - Buscar todas as parcelas por origemId
    - Calcular soma de valorPago de parcelas não-canceladas
    - Validar: novo valor >= soma valorPago (senão rejeitar com erro)
    - Validar: existem parcelas PENDENTE (senão rejeitar com erro)
    - Calcular valor restante = novoValorTotal - soma valorPago
    - Usar `InstallmentCalculator.recalculate()` para redistribuir entre PENDENTES
    - Atualizar valor de cada parcela PENDENTE em transação
    - Atualizar valor da conta
    - Validar integridade pós-operação
    - _Requisitos: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [ ]* 6.2 Escrever teste de propriedade para recalculação (Property 6)
    - **Property 6: Recalculação preserva parcelas pagas e redistribui valor restante**
    - **Valida: Requisitos 5.1, 5.2, 5.5**
    - Arquivo: `installments/src/__tests__/recalculate-installments.property.spec.ts`

  - [ ]* 6.3 Escrever teste de propriedade para rejeição de recalculação (Property 7)
    - **Property 7: Rejeição de recalculação quando novo valor < valor já liquidado**
    - **Valida: Requisitos 5.3**
    - Arquivo: `installments/src/__tests__/recalculate-rejection.property.spec.ts`

- [x] 7. Implementar Regeneração de Parcelas
  - [x] 7.1 Criar RegenerateInstallmentsUseCase
    - Criar arquivo `src/modules/finance/installments/src/application/use-cases/regenerate-installments.use-case.ts`
    - Buscar conta por ID (pagar ou receber conforme tipoConta)
    - Buscar parcelas PENDENTE por origemId
    - Validar: existem parcelas PENDENTE (senão rejeitar)
    - Verificar se existem baixas vinculadas às parcelas PENDENTE (senão rejeitar)
    - Calcular valor restante = valor total da conta - soma valorPago de parcelas PAGO/PARCIAL
    - Cancelar todas as parcelas PENDENTE existentes
    - Obter próximo número de parcela disponível com `getMaxNumeroParcela()`
    - Gerar novas parcelas com `InstallmentCalculator.calculate()` usando valor restante
    - Criar novas parcelas com numeração sequencial a partir do próximo número
    - Derivar e atualizar status da conta conforme regras (PENDENTE/PARCIAL/PAGO)
    - Executar tudo em transação atômica
    - Validar integridade pós-operação
    - _Requisitos: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [ ]* 7.2 Escrever teste de propriedade para regeneração (Property 8)
    - **Property 8: Regeneração preserva parcelas pagas e gera novas para valor restante**
    - **Valida: Requisitos 6.1, 6.2**
    - Arquivo: `installments/src/__tests__/regenerate-installments.property.spec.ts`

  - [ ]* 7.3 Escrever teste de propriedade para derivação de status (Property 9)
    - **Property 9: Derivação correta do status da conta a partir das parcelas**
    - **Valida: Requisitos 6.6**
    - Arquivo: `installments/src/__tests__/parent-status-derivation.property.spec.ts`

  - [ ]* 7.4 Escrever teste de propriedade para numeração sequencial (Property 11)
    - **Property 11: Numeração sequencial e única por conta de origem**
    - **Valida: Requisitos 8.3**
    - Arquivo: `installments/src/__tests__/sequential-numbering.property.spec.ts`

- [x] 8. Checkpoint - Verificar recalculação e regeneração
  - Garantir que todos os testes passam, perguntar ao usuário se houver dúvidas.

- [x] 9. Implementar Consulta com Resumo de Parcelamento
  - [x] 9.1 Criar FindInstallmentsByOrigemUseCase com resumo
    - Criar arquivo `src/modules/finance/installments/src/application/use-cases/find-installments-by-origem.use-case.ts`
    - Buscar parcelas por origemId ordenadas por numeroParcela ASC
    - Calcular resumo: valor total (soma valor das não-canceladas), quantidade total (excluindo canceladas), quantidade pagas, valor total pago (soma valorPago das não-canceladas), valor restante
    - Retornar lista de parcelas + objeto de resumo
    - Se não existirem parcelas, retornar resumo zerado
    - _Requisitos: 7.1, 7.2, 7.5, 7.6_

  - [x] 9.2 Estender GetByIdAccountPayableUseCase para incluir resumo de parcelamento
    - Atualizar `src/modules/finance/accounts-payable/src/application/use-cases/get-by-id-account-payable.use-case.ts`
    - Injetar `IInstallmentRepository`
    - Após buscar a conta, buscar parcelas por origemId e calcular resumo
    - Incluir resumo na resposta da conta
    - _Requisitos: 7.3_

  - [x] 9.3 Estender GetByIdAccountReceivableUseCase para incluir resumo de parcelamento
    - Atualizar `src/modules/finance/accounts-receivable/src/application/use-cases/get-by-id-account-receivable.use-case.ts`
    - Mesma lógica do 9.2 adaptada para contas a receber
    - _Requisitos: 7.4_

  - [ ]* 9.4 Escrever teste de propriedade para resumo do parcelamento (Property 10)
    - **Property 10: Resumo do parcelamento exclui canceladas e calcula corretamente**
    - **Valida: Requisitos 7.1, 7.2, 7.6**
    - Arquivo: `installments/src/__tests__/installment-summary.property.spec.ts`

  - [ ]* 9.5 Escrever testes unitários para consulta com resumo
    - Testar conta sem parcelas retorna resumo zerado
    - Testar exclusão de canceladas do cálculo
    - Arquivo: `installments/src/__tests__/installment-summary.spec.ts`
    - _Requisitos: 7.5, 7.6_

- [x] 10. Implementar Camada de Apresentação (Controllers)
  - [x] 10.1 Adicionar endpoints de recalculação e regeneração ao InstallmentsController
    - Atualizar `src/modules/finance/installments/src/presentation/controllers/installments.controller.ts`
    - Adicionar `PUT /installments/recalculate` → `RecalculateInstallmentsUseCase`
    - Adicionar `PUT /installments/regenerate` → `RegenerateInstallmentsUseCase`
    - Adicionar `GET /installments?origemId=X` → `FindInstallmentsByOrigemUseCase`
    - _Requisitos: 5.1, 6.1, 7.1_

  - [x] 10.2 Registrar novos providers no InstallmentsModule
    - Atualizar `src/modules/finance/installments/src/installments.module.ts`
    - Registrar `InstallmentCalculator`, `InstallmentValidation`
    - Registrar `RecalculateInstallmentsUseCase`, `RegenerateInstallmentsUseCase`, `FindInstallmentsByOrigemUseCase`
    - Exportar serviços necessários para os módulos de contas
    - _Requisitos: 5.1, 6.1, 7.1_

  - [x] 10.3 Atualizar módulos de Contas a Pagar e Contas a Receber
    - Atualizar `accounts-payable.module.ts` para importar `InstallmentsModule` e injetar dependências nos use cases refatorados
    - Atualizar `accounts-receivable.module.ts` com a mesma lógica
    - _Requisitos: 1.1, 2.1_

- [x] 11. Criar Geradores Compartilhados para Testes de Propriedade
  - [x] 11.1 Criar arquivo de geradores (arbitraries) reutilizáveis
    - Criar `src/modules/finance/installments/src/__tests__/generators/installment.generators.ts`
    - Implementar geradores: `monetaryValue()`, `installmentCount()`, `intervalMonths()`, `baseDate()`, `tipoConta()`
    - Usar fast-check como biblioteca de PBT
    - _Requisitos: Suporte a todos os testes de propriedade_

- [x] 12. Checkpoint Final - Verificar integração completa
  - Garantir que todos os testes passam, perguntar ao usuário se houver dúvidas.

## Notes

- Tasks marcadas com `*` são opcionais e podem ser puladas para um MVP mais rápido
- Cada task referencia requisitos específicos para rastreabilidade
- Checkpoints garantem validação incremental
- Testes de propriedade validam propriedades universais de corretude definidas no design
- Testes unitários validam exemplos específicos e edge cases
- Todas as operações de escrita devem usar `connection().tx()` para transações atômicas (padrão existente no projeto)
- O `InstallmentCalculator` é um Domain Service puro (sem dependências de infra), facilitando testes unitários e de propriedade

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "3.3", "3.4", "11.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "1.4", "1.5", "1.6", "3.1"] },
    { "id": 2, "tasks": ["1.7", "1.8", "3.2"] },
    { "id": 3, "tasks": ["4.1", "4.2"] },
    { "id": 4, "tasks": ["4.3", "4.4", "6.1"] },
    { "id": 5, "tasks": ["6.2", "6.3", "7.1"] },
    { "id": 6, "tasks": ["7.2", "7.3", "7.4", "9.1"] },
    { "id": 7, "tasks": ["9.2", "9.3", "9.4", "9.5"] },
    { "id": 8, "tasks": ["10.1", "10.2"] },
    { "id": 9, "tasks": ["10.3"] }
  ]
}
```
