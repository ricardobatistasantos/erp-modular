# Implementation Plan: Financial History

## Overview

Implementação do módulo de Histórico Financeiro Unificado — uma timeline/audit trail append-only que registra automaticamente todos os eventos financeiros do sistema. O plano cria o módulo `financial-history` seguindo a arquitetura limpa do projeto (domain → infra → application → presentation), configura a tabela `historico_financeiro` com triggers de imutabilidade, implementa os use cases de consulta com filtros e paginação, e integra o serviço nos módulos existentes (financial-settlements, installments, estornos) para registro transacional de eventos.

## Tasks

- [ ] 1. Database — Criar tabela e triggers de imutabilidade
  - [ ] 1.1 Criar migration para tabela `historico_financeiro`
    - Criar tabela com colunas: id (UUID PK), tipo_evento (VARCHAR(30) com CHECK), tipo_conta (VARCHAR(10) com CHECK), conta_id (UUID NOT NULL), parcela_id (UUID NULL), pessoa_id (UUID NOT NULL), valor (NUMERIC(15,2) NOT NULL), descricao (VARCHAR(255) NOT NULL), referencia_id (UUID NOT NULL), metadados (JSONB NULL), usuario_id (UUID NULL), data_evento (TIMESTAMP NOT NULL), created_at (TIMESTAMP NOT NULL DEFAULT NOW())
    - Criar índices: idx_hist_fin_conta_id, idx_hist_fin_parcela_id (parcial), idx_hist_fin_pessoa_id, idx_hist_fin_tipo_evento, idx_hist_fin_data_evento (DESC), idx_hist_fin_tipo_conta, idx_hist_fin_filters (composto)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 7.4_

  - [ ] 1.2 Criar triggers de imutabilidade na tabela `historico_financeiro`
    - Criar function `prevent_historico_modification()` que levanta exceção em UPDATE/DELETE
    - Criar trigger `trg_historico_imutavel_update` BEFORE UPDATE
    - Criar trigger `trg_historico_imutavel_delete` BEFORE DELETE
    - _Requirements: 7.1, 7.3_

- [ ] 2. Domain layer — Entidade, tipos e interface do repositório
  - [ ] 2.1 Criar entidade `FinancialEvent` e tipos associados
    - Criar arquivo `src/modules/finance/financial-history/src/domain/entity/financial-event.entity.ts`
    - Definir type `TipoEvento` com valores: PAGAMENTO, RECEBIMENTO, ESTORNO, CRIACAO_PARCELA, CANCELAMENTO_PARCELA, BAIXA_PARCIAL, ALTERACAO_STATUS
    - Definir type `TipoConta` com valores: PAGAR, RECEBER
    - Definir interface `EventoMetadados` com campos opcionais: juros, multa, desconto, motivoEstorno, formaPagamento, statusAnterior, statusNovo, quantidadeParcelas, numeroParcela, saldoRestante, valorTotal
    - Definir class `FinancialEvent` com todos os campos do design
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.1, 2.4_

  - [ ] 2.2 Criar interface `IFinancialHistoryRepository`
    - Criar arquivo `src/modules/finance/financial-history/src/domain/repository/financial-history.interface.repository.ts`
    - Definir interfaces: `PaginationParams`, `PaginationMeta`, `PaginatedResult<T>`, `FinancialHistoryFilters`
    - Definir interface `IFinancialHistoryRepository` com métodos: `create`, `findByContaId`, `findByParcelaId`, `findWithFilters`, `findTimeline`
    - O método `create` deve aceitar `transaction?: any` como parâmetro para uso transacional
    - _Requirements: 3.1, 3.3, 4.1, 4.5, 5.1, 6.1, 6.2, 8.4_

- [ ] 3. Infrastructure layer — Implementação do repositório
  - [ ] 3.1 Implementar `FinancialHistoryRepository`
    - Criar arquivo `src/modules/finance/financial-history/src/infra/repository/financial-history.repository.ts`
    - Implementar `create`: INSERT INTO historico_financeiro usando `transaction` quando fornecido, senão `connection()`
    - Implementar `findByContaId`: SELECT com WHERE conta_id, ORDER BY data_evento DESC, com paginação LIMIT/OFFSET e COUNT total
    - Implementar `findByParcelaId`: SELECT com WHERE parcela_id, ORDER BY data_evento DESC, com paginação
    - Implementar `findWithFilters`: Construir WHERE clause dinâmica com AND para cada filtro ativo (tipoEvento, tipoConta, pessoaId, dataInicio, dataFim), ORDER BY data_evento DESC, com paginação
    - Implementar `findTimeline`: SELECT com JOIN na tabela `pessoa` para incluir `pessoaNome`, ORDER BY data_evento DESC, com paginação
    - Usar pg-promise helpers para parametrização segura de queries
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 6.1, 6.2, 6.3, 7.4, 8.4, 8.5_

- [ ] 4. Checkpoint — Verificar domain e infra layers
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Application layer — DTOs
  - [ ] 5.1 Criar DTOs de consulta
    - Criar arquivo `src/modules/finance/financial-history/src/application/dto/find-by-conta-id.dto.ts` com campos: contaId (string), page (number, default 1), pageSize (number, default 20)
    - Criar arquivo `src/modules/finance/financial-history/src/application/dto/find-by-parcela-id.dto.ts` com campos: parcelaId (string), page (number, default 1), pageSize (number, default 20)
    - Criar arquivo `src/modules/finance/financial-history/src/application/dto/find-with-filters.dto.ts` com campos opcionais: tipoEvento, tipoConta, pessoaId, dataInicio, dataFim, page (default 1), pageSize (default 20)
    - Criar arquivo `src/modules/finance/financial-history/src/application/dto/find-timeline.dto.ts` com campos: page (default 1), pageSize (default 20, max 100)
    - Adicionar validações com class-validator: pageSize max 100, page >= 1, dataInicio <= dataFim
    - _Requirements: 3.3, 4.1, 4.2, 4.3, 4.4, 5.2, 6.2_

  - [ ] 5.2 Criar interface `RegisterEventInput`
    - Criar arquivo `src/modules/finance/financial-history/src/application/dto/register-event.input.ts`
    - Definir interface com campos: tipoEvento, tipoConta, contaId, parcelaId (opcional), pessoaId, valor, descricao, referenciaId, metadados (opcional), usuarioId (opcional), dataEvento
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 6. Application layer — Use Cases
  - [ ] 6.1 Implementar `RegisterEventUseCase`
    - Criar arquivo `src/modules/finance/financial-history/src/application/use-cases/register-event.use-case.ts`
    - Receber `RegisterEventInput` e `transaction` opcional
    - Validar campos obrigatórios e tipos de evento/conta
    - Delegar ao repositório passando a transação
    - Retornar `FinancialEvent` criado
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 8.4, 8.5_

  - [ ] 6.2 Implementar `FindByContaIdUseCase`
    - Criar arquivo `src/modules/finance/financial-history/src/application/use-cases/find-by-conta-id.use-case.ts`
    - Receber `FindByContaIdDTO`, delegar ao repositório com paginação
    - Retornar `PaginatedResult<FinancialEvent>`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ] 6.3 Implementar `FindByParcelaIdUseCase`
    - Criar arquivo `src/modules/finance/financial-history/src/application/use-cases/find-by-parcela-id.use-case.ts`
    - Receber `FindByParcelaIdDTO`, delegar ao repositório com paginação
    - Retornar `PaginatedResult<FinancialEvent>`
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ] 6.4 Implementar `FindWithFiltersUseCase`
    - Criar arquivo `src/modules/finance/financial-history/src/application/use-cases/find-with-filters.use-case.ts`
    - Receber `FindWithFiltersDTO`, validar que dataInicio <= dataFim (se ambos informados)
    - Construir objeto de filtros e delegar ao repositório
    - Retornar `PaginatedResult<FinancialEvent>`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ] 6.5 Implementar `FindTimelineUseCase`
    - Criar arquivo `src/modules/finance/financial-history/src/application/use-cases/find-timeline.use-case.ts`
    - Receber `FindTimelineDTO`, aplicar pageSize padrão de 20 e máximo de 100
    - Delegar ao repositório
    - Retornar `PaginatedResult<FinancialEvent & { pessoaNome: string }>`
    - _Requirements: 5.1, 5.2, 5.3_

- [ ] 7. Application layer — FinancialHistoryService (fachada para módulos externos)
  - [ ] 7.1 Implementar `FinancialHistoryService`
    - Criar arquivo `src/modules/finance/financial-history/src/application/services/financial-history.service.ts`
    - Injetar `IFinancialHistoryRepository`
    - Implementar método `registerEvent(input: RegisterEventInput, transaction?: any): Promise<FinancialEvent>`
    - Validar tipoEvento e tipoConta antes de delegar ao repositório
    - Este serviço é exportado pelo módulo para uso pelos módulos externos
    - _Requirements: 8.4, 8.5_

- [ ] 8. Checkpoint — Verificar application layer
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Presentation layer — Controller e módulo NestJS
  - [ ] 9.1 Implementar `FinancialHistoryController`
    - Criar arquivo `src/modules/finance/financial-history/src/presentation/controllers/financial-history.controller.ts`
    - Endpoint `GET /financial-history/conta/:contaId` → `FindByContaIdUseCase`
    - Endpoint `GET /financial-history/parcela/:parcelaId` → `FindByParcelaIdUseCase`
    - Endpoint `GET /financial-history` com query params (tipoEvento, tipoConta, pessoaId, dataInicio, dataFim, page, pageSize) → `FindWithFiltersUseCase`
    - Endpoint `GET /financial-history/timeline` com query params (page, pageSize) → `FindTimelineUseCase`
    - Aplicar validação de DTOs com ValidationPipe
    - _Requirements: 3.1, 4.1, 5.1, 6.1_

  - [ ] 9.2 Criar `FinancialHistoryModule`
    - Criar arquivo `src/modules/finance/financial-history/src/financial-history.module.ts`
    - Importar `DatabaseModule`
    - Registrar providers: `IFinancialHistoryRepository` (useClass: FinancialHistoryRepository), FinancialHistoryService, RegisterEventUseCase, FindByContaIdUseCase, FindByParcelaIdUseCase, FindWithFiltersUseCase, FindTimelineUseCase
    - Registrar controller: FinancialHistoryController
    - Exportar: FinancialHistoryService
    - _Requirements: 8.4_

  - [ ] 9.3 Registrar `FinancialHistoryModule` no `AppModule`
    - Adicionar import de `FinancialHistoryModule` em `src/app.module.ts`
    - _Requirements: 8.4_

- [ ] 10. Integração — Registrar eventos nos módulos existentes
  - [ ] 10.1 Integrar com `FinancialSettlementsModule`
    - Importar `FinancialHistoryModule` no `FinancialSettlementsModule`
    - Injetar `FinancialHistoryService` no `SettleInstallmentUseCase`
    - Após a baixa financeira, chamar `financialHistoryService.registerEvent()` dentro da mesma transação com tipoEvento PAGAMENTO ou RECEBIMENTO (baseado no tipoConta), incluindo metadados (juros, multa, desconto, formaPagamento)
    - Para baixas parciais, usar tipoEvento BAIXA_PARCIAL com metadados (saldoRestante)
    - _Requirements: 1.1, 1.5, 8.1, 8.5_

  - [ ] 10.2 Integrar com `InstallmentsModule`
    - Importar `FinancialHistoryModule` no `InstallmentsModule`
    - Injetar `FinancialHistoryService` no `GenerateInstallmentsUseCase`
    - Após gerar parcelas, chamar `registerEvent()` com tipoEvento CRIACAO_PARCELA e metadados (quantidadeParcelas, valorTotal)
    - Injetar `FinancialHistoryService` no `CancelInstallmentUseCase`
    - Após cancelar parcela, chamar `registerEvent()` com tipoEvento CANCELAMENTO_PARCELA e metadados (numeroParcela, valor)
    - Ambas chamadas dentro da mesma transação
    - _Requirements: 1.3, 1.4, 8.3, 8.5_

  - [ ] 10.3 Integrar registro de ALTERACAO_STATUS
    - Identificar os pontos nos use cases existentes onde o status de uma conta é alterado (SettleInstallmentUseCase, CancelInstallmentUseCase)
    - Chamar `registerEvent()` com tipoEvento ALTERACAO_STATUS e metadados (statusAnterior, statusNovo) dentro da mesma transação
    - _Requirements: 1.6, 8.5_

- [ ] 11. Checkpoint — Verificar integração entre módulos
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Property-based tests
  - [ ]* 12.1 Write property test: event type mapping correctness
    - **Property 1: Event type mapping correctness**
    - Para qualquer operação financeira, o evento registrado deve ter o `tipoEvento` correto derivado do tipo de operação e o `tipoConta` correto derivado do tipo de conta
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6**

  - [ ]* 12.2 Write property test: event structural completeness
    - **Property 2: Event structural completeness**
    - Para qualquer input válido de registro, o `FinancialEvent` armazenado deve conter todos os campos obrigatórios com valores não-nulos
    - **Validates: Requirements 2.1, 2.2**

  - [ ]* 12.3 Write property test: metadados round-trip preservation
    - **Property 3: Metadados round-trip preservation**
    - Para qualquer objeto `EventoMetadados` válido, armazenar e recuperar o evento deve preservar todos os pares chave-valor exatamente
    - **Validates: Requirements 2.4**

  - [ ]* 12.4 Write property test: query results ordering invariant
    - **Property 4: Query results ordering invariant**
    - Para qualquer consulta (por contaId, parcelaId ou timeline), os eventos retornados devem estar ordenados por `dataEvento` em ordem estritamente decrescente
    - **Validates: Requirements 3.1, 5.1, 6.1**

  - [ ]* 12.5 Write property test: pagination correctness
    - **Property 5: Pagination correctness**
    - Para N eventos, a página P com pageSize S deve retornar exatamente min(S, N-(P-1)*S) eventos, e a união de todas as páginas deve ser o resultado completo sem duplicatas
    - **Validates: Requirements 3.3, 6.2**

  - [ ]* 12.6 Write property test: filter correctness with AND semantics
    - **Property 6: Filter correctness with AND semantics**
    - Para qualquer combinação de filtros, todo evento no resultado deve satisfazer TODOS os filtros ativos simultaneamente
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**

  - [ ]* 12.7 Write property test: immutability invariant
    - **Property 7: Immutability invariant**
    - Para qualquer evento existente, tentativas de UPDATE ou DELETE devem ser rejeitadas com erro
    - **Validates: Requirements 7.1, 7.3**

  - [ ]* 12.8 Write property test: unique ID generation
    - **Property 8: Unique ID generation**
    - Para N eventos criados, todos devem ter `id` distintos e cada `id` deve ser um UUID válido
    - **Validates: Requirements 7.4**

- [ ] 13. Unit tests
  - [ ]* 13.1 Write unit tests para `RegisterEventUseCase`
    - Testar registro com todos os campos obrigatórios
    - Testar rejeição de tipoEvento inválido
    - Testar rejeição de tipoConta inválido
    - Testar que parcelaId é opcional
    - Testar que metadados é opcional
    - Testar que transaction é passada ao repositório
    - Arquivo: `src/modules/finance/financial-history/src/__tests__/register-event.use-case.spec.ts`
    - _Requirements: 1.1, 2.1, 8.4, 8.5_

  - [ ]* 13.2 Write unit tests para `FindWithFiltersUseCase`
    - Testar consulta sem filtros retorna todos os eventos paginados
    - Testar filtro por tipoEvento
    - Testar filtro por tipoConta
    - Testar filtro por período (dataInicio e dataFim)
    - Testar rejeição quando dataInicio > dataFim
    - Testar combinação de múltiplos filtros
    - Testar pageSize máximo de 100
    - Arquivo: `src/modules/finance/financial-history/src/__tests__/find-with-filters.use-case.spec.ts`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 13.3 Write unit tests para `FindTimelineUseCase`
    - Testar pageSize padrão de 20
    - Testar que resposta inclui `pessoaNome`
    - Testar paginação com page e pageSize
    - Testar retorno de lista vazia com meta de paginação
    - Arquivo: `src/modules/finance/financial-history/src/__tests__/find-timeline.use-case.spec.ts`
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ]* 13.4 Write unit tests para `FindByContaIdUseCase` e `FindByParcelaIdUseCase`
    - Testar retorno de eventos ordenados por dataEvento DESC
    - Testar retorno de lista vazia quando não há eventos
    - Testar paginação correta
    - Arquivo: `src/modules/finance/financial-history/src/__tests__/find-by-id.use-case.spec.ts`
    - _Requirements: 3.1, 3.4, 6.1, 6.3_

- [ ] 14. Final checkpoint — Verificação completa
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- O projeto usa TypeScript com NestJS, pg-promise para PostgreSQL, Jest + fast-check para testes
- A tabela `historico_financeiro` substitui a antiga `historico_contas` — migração de dados legados pode ser feita separadamente
- O `FinancialHistoryService` é a interface pública do módulo para os módulos externos
- Todas as chamadas de `registerEvent` devem ocorrer dentro da transação do módulo chamador para garantir atomicidade
- O módulo não expõe endpoints de escrita (POST/PUT/DELETE) — o registro é feito exclusivamente via serviço interno

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "2.2"] },
    { "id": 2, "tasks": ["3.1", "5.1", "5.2"] },
    { "id": 3, "tasks": ["6.1", "6.2", "6.3", "6.4", "6.5"] },
    { "id": 4, "tasks": ["7.1"] },
    { "id": 5, "tasks": ["9.1", "9.2"] },
    { "id": 6, "tasks": ["9.3"] },
    { "id": 7, "tasks": ["10.1", "10.2", "10.3"] },
    { "id": 8, "tasks": ["12.1", "12.2", "12.3", "12.4", "12.5", "12.6", "12.7", "12.8"] },
    { "id": 9, "tasks": ["13.1", "13.2", "13.3", "13.4"] }
  ]
}
```
