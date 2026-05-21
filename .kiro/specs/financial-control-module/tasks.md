# Implementation Plan: Módulo de Controle Financeiro

## Overview

Implementação completa do módulo de controle financeiro seguindo a arquitetura limpa (Clean Architecture) com NestJS e pg-promise. Os submódulos serão implementados na ordem de dependência: Plano de Contas → Centro de Custos → Categorias Financeiras → Contas a Pagar → Contas a Receber → Parcelas → Lançamentos Financeiros → Baixas Financeiras → Formas de Pagamento.

## Tasks

- [x] 1. Implementar submódulo Plano de Contas (chart-of-accounts)
  - [x] 1.1 Criar entidade, interface de repositório e BaseUseCase
    - Criar `src/modules/finance/chart-of-accounts/src/domain/entity/chart-of-accounts.entity.ts` com a classe ChartOfAccounts (id, codigo, nome, tipo, natureza, contaPaiId, aceitaLancamento, ativo, createdAt, updatedAt)
    - Criar `src/modules/finance/chart-of-accounts/src/domain/repository/chart-of-accounts.interface.repository.ts` com IChartOfAccountsRepository (create, findById, findAll, update, findByCodigo)
    - Criar `src/modules/finance/chart-of-accounts/src/domain/use-case/base.use-case.ts` com interface BaseUseCase<I, O>
    - _Requisitos: 1.1, 1.2, 2.6_

  - [x] 1.2 Criar DTOs do Plano de Contas
    - Criar `src/modules/finance/chart-of-accounts/src/application/dto/create-chart-of-accounts.dto.ts` com campos obrigatórios (codigo, nome, tipo, natureza, aceitaLancamento) e opcional (contaPaiId)
    - Criar `src/modules/finance/chart-of-accounts/src/application/dto/update-chart-of-accounts.dto.ts` com todos os campos opcionais
    - Criar `src/modules/finance/chart-of-accounts/src/application/dto/pagination-query.dto.ts` com page (padrão 1) e limit (padrão 10)
    - _Requisitos: 11.1, 11.2, 11.3, 11.4_

  - [x] 1.3 Implementar repositório pg-promise do Plano de Contas
    - Criar `src/modules/finance/chart-of-accounts/src/infra/repository/chart-of-accounts.repository.ts`
    - Injetar 'DATABASE_CONNECTION' via construtor
    - Implementar create com INSERT RETURNING usando gen_random_uuid()
    - Implementar findById com db.oneOrNone()
    - Implementar findAll com LIMIT/OFFSET e COUNT separado
    - Implementar update com COALESCE para cada campo
    - Implementar findByCodigo para verificação de unicidade
    - Aceitar parâmetro transaction opcional em create e update
    - _Requisitos: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

  - [x] 1.4 Implementar use-cases do Plano de Contas
    - Criar CreateChartOfAccountsUseCase com validação de codigo duplicado (409) e contaPaiId inválido (400)
    - Criar GetByIdChartOfAccountsUseCase com tratamento de 404
    - Criar FindAllChartOfAccountsUseCase com paginação e valores padrão
    - Criar UpdateChartOfAccountsUseCase com validação de existência (404) e campos inválidos (400)
    - _Requisitos: 2.1, 2.2, 2.3, 2.4, 2.5, 2.7, 2.8_

  - [x] 1.5 Implementar controller e módulo NestJS do Plano de Contas
    - Criar `src/modules/finance/chart-of-accounts/src/presentation/controllers/chart-of-accounts.controller.ts` com rotas POST, GET /:id, GET (lista), PUT /:id
    - Criar `src/modules/finance/chart-of-accounts/src/chart-of-accounts.module.ts` registrando providers com tokens string
    - Exportar use-cases para uso por outros módulos
    - _Requisitos: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

  - [ ]* 1.6 Escrever testes de propriedade para Plano de Contas
    - **Propriedade 1: Round-trip de criação e consulta**
    - **Propriedade 3: Atualização parcial preserva campos não informados (COALESCE)**
    - **Propriedade 4: Rejeição de entrada inválida**
    - **Valida: Requisitos 2.1, 2.2, 2.4, 2.7**

  - [ ]* 1.7 Escrever testes unitários para Plano de Contas
    - Testar cenário 404 em GetById e Update
    - Testar cenário 409 para codigo duplicado
    - Testar cenário 400 para contaPaiId inexistente
    - Testar valores padrão de paginação
    - _Requisitos: 2.5, 2.7, 2.8_


- [x] 2. Implementar submódulo Centro de Custos (cost-centers)
  - [x] 2.1 Criar entidade, interface de repositório e BaseUseCase
    - Criar `src/modules/finance/cost-centers/src/domain/entity/cost-center.entity.ts` com a classe CostCenter (id, codigo, nome, descricao, centroPaiId, ativo, createdAt, updatedAt)
    - Criar `src/modules/finance/cost-centers/src/domain/repository/cost-center.interface.repository.ts` com ICostCenterRepository (create, findById, findAll, update, findByCodigo)
    - Criar `src/modules/finance/cost-centers/src/domain/use-case/base.use-case.ts`
    - _Requisitos: 1.1, 1.2, 3.6_

  - [x] 2.2 Criar DTOs do Centro de Custos
    - Criar CreateCostCenterDTO com campos obrigatórios (codigo, nome) e opcionais (descricao, centroPaiId)
    - Criar UpdateCostCenterDTO com todos os campos opcionais
    - Criar PaginationQueryDTO com page e limit
    - _Requisitos: 11.1, 11.2, 11.3, 11.4_

  - [x] 2.3 Implementar repositório pg-promise do Centro de Custos
    - Criar `src/modules/finance/cost-centers/src/infra/repository/cost-center.repository.ts`
    - Implementar CRUD com queries parametrizadas, COALESCE no update, paginação LIMIT/OFFSET
    - Implementar findByCodigo para verificação de unicidade
    - _Requisitos: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

  - [x] 2.4 Implementar use-cases do Centro de Custos
    - Criar CreateCostCenterUseCase com validação de codigo duplicado (409) e centroPaiId inválido (400)
    - Criar GetByIdCostCenterUseCase com tratamento de 404
    - Criar FindAllCostCentersUseCase com paginação
    - Criar UpdateCostCenterUseCase com validação de existência (404)
    - _Requisitos: 3.1, 3.2, 3.3, 3.4, 3.5, 3.7, 3.8, 3.9_

  - [x] 2.5 Implementar controller e módulo NestJS do Centro de Custos
    - Criar controller com rotas POST, GET /:id, GET (lista), PUT /:id
    - Criar cost-centers.module.ts registrando providers e exportando use-cases
    - _Requisitos: 13.1, 13.2, 13.3, 13.4, 13.5_

  - [ ]* 2.6 Escrever testes de propriedade para Centro de Custos
    - **Propriedade 1: Round-trip de criação e consulta**
    - **Propriedade 2: Invariantes de paginação**
    - **Propriedade 3: Atualização parcial preserva campos não informados**
    - **Valida: Requisitos 3.1, 3.2, 3.3, 3.4**

  - [ ]* 2.7 Escrever testes unitários para Centro de Custos
    - Testar cenário 404, 409 (codigo duplicado), 400 (centroPaiId inválido)
    - _Requisitos: 3.5, 3.7, 3.8, 3.9_


- [x] 3. Implementar submódulo Categorias Financeiras (financial-categories)
  - [x] 3.1 Criar entidade, interface de repositório e BaseUseCase
    - Criar `src/modules/finance/financial-categories/src/domain/entity/financial-category.entity.ts` com a classe FinancialCategory (id, nome, descricao, tipo, planoContaId, ativo, createdAt, updatedAt)
    - Criar `src/modules/finance/financial-categories/src/domain/repository/financial-category.interface.repository.ts` com IFinancialCategoryRepository
    - Criar `src/modules/finance/financial-categories/src/domain/use-case/base.use-case.ts`
    - _Requisitos: 1.1, 1.2, 4.8_

  - [x] 3.2 Criar DTOs das Categorias Financeiras
    - Criar CreateFinancialCategoryDTO com campos obrigatórios (nome, tipo) e opcionais (descricao, planoContaId)
    - Criar UpdateFinancialCategoryDTO com todos os campos opcionais incluindo ativo
    - Criar PaginationQueryDTO
    - _Requisitos: 11.1, 11.2, 11.3, 11.4_

  - [x] 3.3 Implementar repositório pg-promise das Categorias Financeiras
    - Criar `src/modules/finance/financial-categories/src/infra/repository/financial-category.repository.ts`
    - Implementar CRUD com queries parametrizadas, COALESCE no update, paginação LIMIT/OFFSET
    - _Requisitos: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

  - [x] 3.4 Implementar use-cases das Categorias Financeiras
    - Criar CreateFinancialCategoryUseCase com validação de planoContaId existente (422 se inválido)
    - Criar GetByIdFinancialCategoryUseCase com tratamento de 404
    - Criar FindAllFinancialCategoriesUseCase com paginação
    - Criar UpdateFinancialCategoryUseCase com validação de existência (404) e planoContaId (422)
    - Injetar IChartOfAccountsRepository para validar planoContaId
    - _Requisitos: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [x] 3.5 Implementar controller e módulo NestJS das Categorias Financeiras
    - Criar controller com rotas POST, GET /:id, GET (lista), PUT /:id
    - Criar financial-categories.module.ts importando ChartOfAccountsModule para acesso ao repositório
    - _Requisitos: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

  - [ ]* 3.6 Escrever testes de propriedade para Categorias Financeiras
    - **Propriedade 1: Round-trip de criação e consulta**
    - **Propriedade 4: Rejeição de entrada inválida**
    - **Valida: Requisitos 4.1, 4.2, 4.4**

  - [ ]* 3.7 Escrever testes unitários para Categorias Financeiras
    - Testar cenário 404, 422 (planoContaId inexistente), 400 (campos inválidos)
    - _Requisitos: 4.2, 4.3, 4.7_

- [x] 4. Checkpoint - Verificar submódulos base
  - Garantir que todos os testes passam para Plano de Contas, Centro de Custos e Categorias Financeiras. Perguntar ao usuário se há dúvidas.


- [x] 5. Implementar submódulo Contas a Pagar (accounts-payable)
  - [x] 5.1 Criar entidade, interface de repositório e BaseUseCase
    - Criar `src/modules/finance/accounts-payable/src/domain/entity/account-payable.entity.ts` com a classe AccountPayable (id, pessoaId, numeroDocumento, descricao, categoriaFinanceiraId, centroCustoId, contaBancariaId, dataEmissao, dataVencimento, valor, valorPago, status, formaPagamento, createdAt, updatedAt)
    - Criar `src/modules/finance/accounts-payable/src/domain/repository/account-payable.interface.repository.ts` com IAccountPayableRepository (create, findById, findAll, update, updateValorPago)
    - Substituir o base.use-case.ts existente mantendo a mesma interface
    - _Requisitos: 1.1, 1.2, 5.6_

  - [x] 5.2 Criar DTOs de Contas a Pagar
    - Criar CreateAccountPayableDTO com campos obrigatórios (pessoaId, numeroDocumento, descricao, categoriaFinanceiraId, dataEmissao, dataVencimento, valor) e opcionais (centroCustoId, contaBancariaId, formaPagamento)
    - Criar UpdateAccountPayableDTO com todos os campos opcionais
    - Criar PaginationQueryDTO
    - _Requisitos: 11.1, 11.2, 11.3_

  - [x] 5.3 Implementar repositório pg-promise de Contas a Pagar
    - Criar `src/modules/finance/accounts-payable/src/infra/repository/account-payable.repository.ts`
    - Implementar create com status='PENDENTE' e valor_pago=0 por padrão
    - Implementar findById, findAll com paginação, update com COALESCE
    - Implementar updateValorPago para atualizar valor_pago e status atomicamente
    - _Requisitos: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

  - [x] 5.4 Implementar use-cases de Contas a Pagar
    - Criar CreateAccountPayableUseCase com validação de data_vencimento >= data_emissao e campos obrigatórios
    - Criar GetByIdAccountPayableUseCase com tratamento de 404
    - Criar FindAllAccountPayablesUseCase com paginação
    - Criar UpdateAccountPayableUseCase com validação de existência e datas
    - _Requisitos: 5.1, 5.2, 5.3, 5.4, 5.5, 5.7, 5.8, 5.9_

  - [x] 5.5 Implementar controller e módulo NestJS de Contas a Pagar
    - Substituir o controller existente com implementação completa (POST, GET /:id, GET lista, PUT /:id)
    - Atualizar accounts-payable.module.ts com providers corretos
    - Exportar use-cases para uso pelo módulo de Baixas Financeiras
    - _Requisitos: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

  - [ ]* 5.6 Escrever testes de propriedade para Contas a Pagar
    - **Propriedade 5: Validação de datas — vencimento ≥ emissão**
    - **Propriedade 6: Inicialização de valores padrão (status=PENDENTE, valorPago=0)**
    - **Valida: Requisitos 5.7, 5.8**

  - [ ]* 5.7 Escrever testes unitários para Contas a Pagar
    - Testar cenário 404, validação de datas, campos obrigatórios ausentes, valor <= 0
    - _Requisitos: 5.5, 5.8, 5.9_


- [x] 6. Implementar submódulo Contas a Receber (accounts-receivable)
  - [x] 6.1 Criar entidade, interface de repositório e BaseUseCase
    - Criar `src/modules/finance/accounts-receivable/src/domain/entity/account-receivable.entity.ts` com a classe AccountReceivable (id, pessoaId, numeroDocumento, descricao, categoriaFinanceiraId, centroCustoId, contaBancariaId, dataEmissao, dataVencimento, valor, valorRecebido, status, formaPagamento, createdAt, updatedAt)
    - Criar `src/modules/finance/accounts-receivable/src/domain/repository/account-receivable.interface.repository.ts` com IAccountReceivableRepository (create, findById, findAll, update, updateValorRecebido)
    - Substituir o base.use-case.ts existente mantendo a mesma interface
    - _Requisitos: 1.1, 1.2, 6.6_

  - [x] 6.2 Criar DTOs de Contas a Receber
    - Criar CreateAccountReceivableDTO com campos obrigatórios (pessoaId, numeroDocumento, descricao, categoriaFinanceiraId, dataEmissao, dataVencimento, valor) e opcionais (centroCustoId, contaBancariaId, formaPagamento)
    - Criar UpdateAccountReceivableDTO com todos os campos opcionais
    - Criar PaginationQueryDTO
    - _Requisitos: 11.1, 11.2, 11.3_

  - [x] 6.3 Implementar repositório pg-promise de Contas a Receber
    - Criar `src/modules/finance/accounts-receivable/src/infra/repository/account-receivable.repository.ts`
    - Implementar create com status='PENDENTE' e valor_recebido=0 por padrão
    - Implementar findById, findAll com paginação, update com COALESCE
    - Implementar updateValorRecebido para atualizar valor_recebido e status atomicamente
    - _Requisitos: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

  - [x] 6.4 Implementar use-cases de Contas a Receber
    - Criar CreateAccountReceivableUseCase com validação de data_vencimento >= data_emissao e campos obrigatórios
    - Criar GetByIdAccountReceivableUseCase com tratamento de 404
    - Criar FindAllAccountReceivablesUseCase com paginação
    - Criar UpdateAccountReceivableUseCase com validação de existência e datas
    - _Requisitos: 6.1, 6.2, 6.3, 6.4, 6.5, 6.7, 6.8, 6.9_

  - [x] 6.5 Implementar controller e módulo NestJS de Contas a Receber
    - Substituir o controller existente com implementação completa (POST, GET /:id, GET lista, PUT /:id)
    - Atualizar accounts-receivable.module.ts com providers corretos
    - Exportar use-cases para uso pelo módulo de Baixas Financeiras
    - _Requisitos: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

  - [ ]* 6.6 Escrever testes de propriedade para Contas a Receber
    - **Propriedade 5: Validação de datas — vencimento ≥ emissão**
    - **Propriedade 6: Inicialização de valores padrão (status=PENDENTE, valorRecebido=0)**
    - **Valida: Requisitos 6.7, 6.8**

  - [ ]* 6.7 Escrever testes unitários para Contas a Receber
    - Testar cenário 404, validação de datas, campos obrigatórios ausentes, valor <= 0
    - _Requisitos: 6.5, 6.8, 6.9_


- [x] 7. Implementar submódulo Parcelas (installments)
  - [x] 7.1 Criar entidade, interface de repositório e BaseUseCase
    - Criar `src/modules/finance/installments/src/domain/entity/installment.entity.ts` com a classe Installment (id, origem, origemId, numeroParcela, totalParcelas, dataVencimento, valor, status, createdAt, updatedAt)
    - Criar `src/modules/finance/installments/src/domain/repository/installment.interface.repository.ts` com IInstallmentRepository (create, findById, findByOrigemId)
    - Criar `src/modules/finance/installments/src/domain/use-case/base.use-case.ts`
    - _Requisitos: 1.1, 1.2, 7.5_

  - [x] 7.2 Criar DTOs de Parcelas
    - Criar CreateInstallmentDTO com campos obrigatórios (origem, origemId, numeroParcela, totalParcelas, dataVencimento, valor)
    - _Requisitos: 11.1, 11.4_

  - [x] 7.3 Implementar repositório pg-promise de Parcelas
    - Criar `src/modules/finance/installments/src/infra/repository/installment.repository.ts`
    - Implementar create com status='PENDENTE' por padrão
    - Implementar findById com db.oneOrNone()
    - Implementar findByOrigemId retornando parcelas ordenadas por numero_parcela ASC
    - _Requisitos: 12.1, 12.2, 12.4_

  - [x] 7.4 Implementar use-cases de Parcelas
    - Criar CreateInstallmentUseCase com validação de origem_id existente (404) e numero_parcela <= total_parcelas (400)
    - Criar GetByIdInstallmentUseCase com tratamento de 404
    - Criar FindByOrigemIdInstallmentUseCase para listar parcelas de uma conta
    - Injetar IAccountPayableRepository e IAccountReceivableRepository para validar origem_id
    - _Requisitos: 7.1, 7.2, 7.3, 7.4, 7.6, 7.7_

  - [x] 7.5 Implementar controller e módulo NestJS de Parcelas
    - Criar controller com rotas POST, GET /:id, GET ?origemId=:id
    - Criar installments.module.ts importando AccountsPayableModule e AccountsReceivableModule
    - _Requisitos: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

  - [ ]* 7.6 Escrever testes de propriedade para Parcelas
    - **Propriedade 10: Validação numero_parcela ≤ total_parcelas**
    - **Propriedade 13: Parcelas ordenadas por numero_parcela**
    - **Valida: Requisitos 7.3, 7.7**

  - [ ]* 7.7 Escrever testes unitários para Parcelas
    - Testar cenário 404 (origem_id inexistente), 400 (numero_parcela > total_parcelas)
    - Testar inicialização de status como PENDENTE
    - _Requisitos: 7.4, 7.6, 7.7_

- [x] 8. Checkpoint - Verificar submódulos de contas e parcelas
  - Garantir que todos os testes passam para Contas a Pagar, Contas a Receber e Parcelas. Perguntar ao usuário se há dúvidas.


- [x] 9. Implementar submódulo Lançamentos Financeiros (financial-entries)
  - [x] 9.1 Criar entidade, interface de repositório e BaseUseCase
    - Criar `src/modules/finance/financial-entries/src/domain/entity/financial-entry.entity.ts` com a classe FinancialEntry (id, tipo, origem, origemId, planoContaId, centroCustoId, contaBancariaId, caixaId, dataLancamento, descricao, valor, saldoAnterior, saldoPosterior)
    - Criar `src/modules/finance/financial-entries/src/domain/repository/financial-entry.interface.repository.ts` com IFinancialEntryRepository (create, findById, findAll)
    - Criar `src/modules/finance/financial-entries/src/domain/use-case/base.use-case.ts`
    - _Requisitos: 1.1, 1.2, 9.8_

  - [x] 9.2 Criar DTOs de Lançamentos Financeiros
    - Criar CreateFinancialEntryDTO com campos obrigatórios (tipo, origem, origemId, planoContaId, dataLancamento, descricao, valor) e opcionais (centroCustoId, contaBancariaId, caixaId)
    - Criar PaginationQueryDTO
    - _Requisitos: 11.1, 11.3_

  - [x] 9.3 Implementar repositório pg-promise de Lançamentos Financeiros
    - Criar `src/modules/finance/financial-entries/src/infra/repository/financial-entry.repository.ts`
    - Implementar create com INSERT RETURNING, aceitar transaction opcional
    - Implementar findById com db.oneOrNone()
    - Implementar findAll com paginação LIMIT/OFFSET e COUNT
    - _Requisitos: 12.1, 12.2, 12.3, 12.4, 12.5_

  - [x] 9.4 Implementar use-cases de Lançamentos Financeiros
    - Criar CreateFinancialEntryUseCase com validação de campos obrigatórios (400) e cálculo de saldo (saldoAnterior/saldoPosterior quando contaBancariaId ou caixaId informado)
    - Criar GetByIdFinancialEntryUseCase com tratamento de 404
    - Criar FindAllFinancialEntriesUseCase com paginação e valores padrão (page=1, limit=10)
    - _Requisitos: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

  - [x] 9.5 Implementar controller e módulo NestJS de Lançamentos Financeiros
    - Criar controller com rotas POST, GET /:id, GET (lista paginada)
    - Criar financial-entries.module.ts exportando CreateFinancialEntryUseCase para uso pelo módulo de Baixas
    - _Requisitos: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

  - [ ]* 9.6 Escrever testes de propriedade para Lançamentos Financeiros
    - **Propriedade 2: Invariantes de paginação**
    - **Propriedade 11: Cálculo de saldo em lançamentos financeiros**
    - **Valida: Requisitos 9.5, 9.7**

  - [ ]* 9.7 Escrever testes unitários para Lançamentos Financeiros
    - Testar cenário 404, campos obrigatórios ausentes (400)
    - Testar cálculo de saldo_posterior para RECEITA e DESPESA
    - _Requisitos: 9.2, 9.4, 9.7_


- [x] 10. Implementar submódulo Baixas Financeiras (financial-settlements)
  - [x] 10.1 Criar entidade, interface de repositório e BaseUseCase
    - Criar `src/modules/finance/financial-settlements/src/domain/entity/financial-settlement.entity.ts` com a classe FinancialSettlement (id, tipoConta, contaId, valor, dataPagamento, formaPagamento, contaBancariaId, caixaId, lancamentoFinanceiroId, observacao, createdAt, updatedAt)
    - Criar `src/modules/finance/financial-settlements/src/domain/repository/financial-settlement.interface.repository.ts` com IFinancialSettlementRepository (create, findById, findByContaId)
    - Criar `src/modules/finance/financial-settlements/src/domain/use-case/base.use-case.ts`
    - _Requisitos: 1.1, 1.2, 8.9_

  - [x] 10.2 Criar DTOs de Baixas Financeiras
    - Criar CreateFinancialSettlementDTO com campos obrigatórios (tipoConta, contaId, valor, dataPagamento, formaPagamento) e opcionais (contaBancariaId, caixaId, observacao)
    - _Requisitos: 11.1, 11.4_

  - [x] 10.3 Implementar repositório pg-promise de Baixas Financeiras
    - Criar `src/modules/finance/financial-settlements/src/infra/repository/financial-settlement.repository.ts`
    - Implementar create com INSERT RETURNING, aceitar transaction
    - Implementar findById com db.oneOrNone()
    - Implementar findByContaId retornando todas as baixas de uma conta
    - _Requisitos: 12.1, 12.2, 12.3, 12.4_

  - [x] 10.4 Implementar use-cases de Baixas Financeiras
    - Criar CreateFinancialSettlementUseCase com lógica transacional (connection().tx):
      1. Buscar conta (pagar ou receber) e validar existência (404)
      2. Validar que valor da baixa não excede saldo restante (400)
      3. Criar lançamento financeiro (tipo DESPESA para PAGAR, RECEITA para RECEBER, origem='BAIXA')
      4. Criar registro de baixa financeira
      5. Atualizar valor_pago/valor_recebido da conta e status se quitada
    - Criar GetByIdFinancialSettlementUseCase com tratamento de 404
    - Criar FindByContaIdFinancialSettlementUseCase
    - Injetar IAccountPayableRepository, IAccountReceivableRepository e CreateFinancialEntryUseCase
    - _Requisitos: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 1.5_

  - [x] 10.5 Implementar controller e módulo NestJS de Baixas Financeiras
    - Criar controller com rotas POST, GET /:id, GET ?contaId=:id
    - Criar financial-settlements.module.ts importando AccountsPayableModule, AccountsReceivableModule e FinancialEntriesModule
    - _Requisitos: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

  - [ ]* 10.6 Escrever testes de propriedade para Baixas Financeiras
    - **Propriedade 7: Baixa incrementa valor pago/recebido e transiciona status**
    - **Propriedade 8: Baixa não pode exceder saldo restante**
    - **Propriedade 9: Baixa cria lançamento associado atomicamente**
    - **Propriedade 12: Atomicidade de transações em operações multi-escrita**
    - **Propriedade 14: Filtro de baixas por contaId retorna apenas registros correspondentes**
    - **Valida: Requisitos 8.2, 8.3, 8.4, 8.6, 8.8**

  - [ ]* 10.7 Escrever testes unitários para Baixas Financeiras
    - Testar cenário 404 (conta inexistente), valor excedendo saldo restante
    - Testar transição de status para PAGO/RECEBIDO quando valor acumulado >= valor total
    - Testar criação de lançamento com tipo correto (DESPESA/RECEITA)
    - _Requisitos: 8.2, 8.3, 8.5, 8.6_


- [x] 11. Implementar submódulo Formas de Pagamento (payment-methods)
  - [x] 11.1 Criar entidade, interface de repositório e BaseUseCase
    - Criar `src/modules/finance/payment-methods/src/domain/entity/payment-method.entity.ts` com a classe PaymentMethod (id, nome, descricao, ativo)
    - Criar `src/modules/finance/payment-methods/src/domain/repository/payment-method.interface.repository.ts` com IPaymentMethodRepository (create, findById, findAll, update)
    - Criar `src/modules/finance/payment-methods/src/domain/use-case/base.use-case.ts`
    - _Requisitos: 1.1, 1.2, 10.7_

  - [x] 11.2 Criar DTOs de Formas de Pagamento
    - Criar CreatePaymentMethodDTO com campo obrigatório (nome) e opcional (descricao)
    - Criar UpdatePaymentMethodDTO com todos os campos opcionais (nome, descricao, ativo)
    - Criar PaginationQueryDTO
    - _Requisitos: 11.1, 11.2, 11.3_

  - [x] 11.3 Implementar repositório pg-promise de Formas de Pagamento
    - Criar `src/modules/finance/payment-methods/src/infra/repository/payment-method.repository.ts`
    - Implementar create com ativo=true por padrão
    - Implementar findById, findAll com paginação, update com COALESCE
    - _Requisitos: 12.1, 12.2, 12.4, 12.5, 12.6_

  - [x] 11.4 Implementar use-cases de Formas de Pagamento
    - Criar CreatePaymentMethodUseCase com validação de nome obrigatório (400)
    - Criar GetByIdPaymentMethodUseCase com tratamento de 404
    - Criar FindAllPaymentMethodsUseCase com paginação
    - Criar UpdatePaymentMethodUseCase com validação de existência (404)
    - _Requisitos: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

  - [x] 11.5 Implementar controller e módulo NestJS de Formas de Pagamento
    - Criar controller com rotas POST, GET /:id, GET (lista), PUT /:id
    - Criar payment-methods.module.ts registrando providers
    - _Requisitos: 13.1, 13.2, 13.3, 13.4, 13.5_

  - [ ]* 11.6 Escrever testes unitários para Formas de Pagamento
    - Testar cenário 404, 400 (nome ausente/vazio)
    - Testar paginação com valores padrão
    - _Requisitos: 10.5, 10.6_

- [x] 12. Checkpoint - Verificar submódulos avançados
  - Garantir que todos os testes passam para Lançamentos Financeiros, Baixas Financeiras e Formas de Pagamento. Perguntar ao usuário se há dúvidas.


- [x] 13. Integração e registro no AppModule
  - [x] 13.1 Registrar todos os submódulos financeiros no AppModule
    - Importar ChartOfAccountsModule, CostCentersModule, FinancialCategoriesModule, AccountsPayableModule, AccountsReceivableModule, InstallmentsModule, FinancialEntriesModule, FinancialSettlementsModule e PaymentMethodsModule no app.module.ts
    - Garantir que o DatabaseModule está importado e disponível
    - _Requisitos: 13.1, 13.5_

  - [ ]* 13.2 Escrever testes de integração para fluxo de baixa financeira
    - Testar fluxo completo: criar conta a pagar → registrar baixa → verificar lançamento criado e status atualizado
    - Testar atomicidade: simular falha no meio da transação e verificar rollback
    - _Requisitos: 8.2, 8.3, 8.4, 1.5_

- [x] 14. Checkpoint final - Validação completa
  - Garantir que todos os testes passam, verificar que todos os endpoints estão acessíveis. Perguntar ao usuário se há dúvidas.

## Notes

- Tarefas marcadas com `*` são opcionais e podem ser puladas para um MVP mais rápido
- Cada tarefa referencia requisitos específicos para rastreabilidade
- Checkpoints garantem validação incremental
- Testes de propriedade validam propriedades universais de corretude definidas no design
- Testes unitários validam cenários específicos e condições de erro
- A ordem de implementação respeita as dependências entre submódulos
- O padrão COALESCE no SQL garante atualização parcial sem lógica extra na aplicação
- Transações pg-promise (connection().tx) garantem atomicidade em operações multi-escrita

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1", "11.1"] },
    { "id": 1, "tasks": ["1.2", "2.2", "11.2"] },
    { "id": 2, "tasks": ["1.3", "2.3", "11.3"] },
    { "id": 3, "tasks": ["1.4", "2.4", "11.4"] },
    { "id": 4, "tasks": ["1.5", "2.5", "11.5"] },
    { "id": 5, "tasks": ["1.6", "1.7", "2.6", "2.7", "11.6", "3.1"] },
    { "id": 6, "tasks": ["3.2"] },
    { "id": 7, "tasks": ["3.3"] },
    { "id": 8, "tasks": ["3.4"] },
    { "id": 9, "tasks": ["3.5"] },
    { "id": 10, "tasks": ["3.6", "3.7", "5.1", "6.1"] },
    { "id": 11, "tasks": ["5.2", "6.2"] },
    { "id": 12, "tasks": ["5.3", "6.3"] },
    { "id": 13, "tasks": ["5.4", "6.4"] },
    { "id": 14, "tasks": ["5.5", "6.5"] },
    { "id": 15, "tasks": ["5.6", "5.7", "6.6", "6.7", "7.1"] },
    { "id": 16, "tasks": ["7.2"] },
    { "id": 17, "tasks": ["7.3"] },
    { "id": 18, "tasks": ["7.4"] },
    { "id": 19, "tasks": ["7.5"] },
    { "id": 20, "tasks": ["7.6", "7.7", "9.1"] },
    { "id": 21, "tasks": ["9.2"] },
    { "id": 22, "tasks": ["9.3"] },
    { "id": 23, "tasks": ["9.4"] },
    { "id": 24, "tasks": ["9.5"] },
    { "id": 25, "tasks": ["9.6", "9.7", "10.1"] },
    { "id": 26, "tasks": ["10.2"] },
    { "id": 27, "tasks": ["10.3"] },
    { "id": 28, "tasks": ["10.4"] },
    { "id": 29, "tasks": ["10.5"] },
    { "id": 30, "tasks": ["10.6", "10.7"] },
    { "id": 31, "tasks": ["13.1"] },
    { "id": 32, "tasks": ["13.2"] }
  ]
}
```
