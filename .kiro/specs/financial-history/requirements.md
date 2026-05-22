# Requirements Document

## Introdução

Este documento define os requisitos para o recurso de **Histórico Financeiro Unificado**. O objetivo é fornecer uma visão consolidada e cronológica de todos os eventos financeiros do sistema — incluindo pagamentos realizados, recebimentos, estornos, criação e cancelamento de parcelas, e alterações de status em contas a pagar/receber. O histórico funciona como uma timeline/audit trail que permite ao operador financeiro rastrear toda a movimentação financeira de forma centralizada, com filtros por tipo de evento, período, conta e pessoa.

## Glossário

- **Sistema_Historico**: Módulo responsável por registrar, consolidar e consultar o histórico financeiro unificado
- **Evento_Financeiro**: Registro individual de uma operação financeira ocorrida no sistema (pagamento, recebimento, estorno, criação de parcela, cancelamento, alteração de status)
- **Tipo_Evento**: Classificação do evento financeiro, podendo ser: PAGAMENTO, RECEBIMENTO, ESTORNO, CRIACAO_PARCELA, CANCELAMENTO_PARCELA, BAIXA_PARCIAL, ALTERACAO_STATUS
- **Conta_Referencia**: Conta a pagar ou conta a receber à qual o evento está vinculado
- **Timeline**: Visualização cronológica dos eventos financeiros ordenados por data de ocorrência (mais recente primeiro)
- **Ator**: Usuário ou processo do sistema que originou o evento financeiro

## Requisitos

### Requisito 1: Registro Automático de Eventos Financeiros

**User Story:** Como um operador financeiro, eu quero que todos os eventos financeiros relevantes sejam registrados automaticamente no histórico, para que eu tenha uma trilha de auditoria completa sem necessidade de registro manual.

#### Critérios de Aceitação

1. WHEN uma baixa financeira é realizada em uma parcela, THE Sistema_Historico SHALL registrar um Evento_Financeiro com Tipo_Evento PAGAMENTO (para contas a pagar) ou RECEBIMENTO (para contas a receber)
2. WHEN um estorno financeiro é realizado, THE Sistema_Historico SHALL registrar um Evento_Financeiro com Tipo_Evento ESTORNO contendo o valor estornado e o motivo
3. WHEN parcelas são geradas para uma conta, THE Sistema_Historico SHALL registrar um Evento_Financeiro com Tipo_Evento CRIACAO_PARCELA contendo a quantidade de parcelas e o valor total
4. WHEN uma parcela é cancelada, THE Sistema_Historico SHALL registrar um Evento_Financeiro com Tipo_Evento CANCELAMENTO_PARCELA contendo o número da parcela e o valor
5. WHEN uma baixa parcial é realizada em uma parcela, THE Sistema_Historico SHALL registrar um Evento_Financeiro com Tipo_Evento BAIXA_PARCIAL contendo o valor pago e o saldo restante
6. WHEN o status de uma conta a pagar ou receber é alterado, THE Sistema_Historico SHALL registrar um Evento_Financeiro com Tipo_Evento ALTERACAO_STATUS contendo o status anterior e o status novo

### Requisito 2: Estrutura do Evento Financeiro

**User Story:** Como um operador financeiro, eu quero que cada evento do histórico contenha informações completas sobre a operação, para que eu possa entender o contexto sem precisar consultar outros módulos.

#### Critérios de Aceitação

1. THE Sistema_Historico SHALL armazenar em cada Evento_Financeiro os campos: id, tipoEvento, tipoConta (PAGAR ou RECEBER), contaId, parcelaId (quando aplicável), valor, descricao, referenciaId (ID da entidade que originou o evento), dataEvento e createdAt
2. THE Sistema_Historico SHALL armazenar o campo pessoaId vinculando o evento à pessoa (cliente ou fornecedor) associada à conta
3. THE Sistema_Historico SHALL armazenar o campo usuarioId identificando o Ator que realizou a operação (quando disponível)
4. THE Sistema_Historico SHALL armazenar um campo metadados (JSON) para informações adicionais específicas de cada Tipo_Evento (juros, multa, desconto, motivo do estorno, forma de pagamento)

### Requisito 3: Consulta de Histórico por Conta

**User Story:** Como um operador financeiro, eu quero consultar o histórico financeiro de uma conta específica, para que eu possa ver toda a movimentação daquela conta em ordem cronológica.

#### Critérios de Aceitação

1. WHEN uma consulta de histórico por contaId é realizada, THE Sistema_Historico SHALL retornar todos os eventos financeiros vinculados àquela conta ordenados por dataEvento em ordem decrescente
2. WHEN uma consulta de histórico por contaId é realizada, THE Sistema_Historico SHALL incluir eventos de todas as parcelas vinculadas à conta
3. THE Sistema_Historico SHALL suportar paginação na consulta de histórico com parâmetros page e pageSize
4. IF a conta informada não possuir eventos registrados, THEN THE Sistema_Historico SHALL retornar uma lista vazia com metadados de paginação

### Requisito 4: Consulta de Histórico com Filtros

**User Story:** Como um operador financeiro, eu quero filtrar o histórico financeiro por tipo de evento, período e pessoa, para que eu possa localizar operações específicas de forma eficiente.

#### Critérios de Aceitação

1. WHEN um filtro por tipoEvento é informado, THE Sistema_Historico SHALL retornar apenas os eventos do tipo especificado
2. WHEN um filtro por período (dataInicio e dataFim) é informado, THE Sistema_Historico SHALL retornar apenas os eventos cuja dataEvento esteja dentro do intervalo especificado (inclusive)
3. WHEN um filtro por pessoaId é informado, THE Sistema_Historico SHALL retornar todos os eventos financeiros vinculados a contas daquela pessoa
4. WHEN um filtro por tipoConta (PAGAR ou RECEBER) é informado, THE Sistema_Historico SHALL retornar apenas os eventos do tipo de conta especificado
5. THE Sistema_Historico SHALL suportar combinação de múltiplos filtros na mesma consulta aplicando condição AND entre os filtros

### Requisito 5: Consulta de Timeline Geral

**User Story:** Como um operador financeiro, eu quero visualizar uma timeline geral de todos os eventos financeiros recentes, para que eu tenha uma visão consolidada da movimentação financeira da empresa.

#### Critérios de Aceitação

1. WHEN uma consulta de timeline geral é realizada sem filtros, THE Sistema_Historico SHALL retornar os eventos financeiros mais recentes ordenados por dataEvento em ordem decrescente
2. THE Sistema_Historico SHALL limitar a consulta de timeline geral com paginação obrigatória (pageSize padrão de 20 registros)
3. THE Sistema_Historico SHALL incluir na resposta de cada evento o nome da pessoa associada à conta para facilitar a identificação

### Requisito 6: Consulta de Histórico por Parcela

**User Story:** Como um operador financeiro, eu quero consultar o histórico de uma parcela específica, para que eu possa ver todas as baixas, estornos e alterações daquela parcela.

#### Critérios de Aceitação

1. WHEN uma consulta de histórico por parcelaId é realizada, THE Sistema_Historico SHALL retornar todos os eventos financeiros vinculados àquela parcela ordenados por dataEvento em ordem decrescente
2. THE Sistema_Historico SHALL suportar paginação na consulta de histórico por parcela com parâmetros page e pageSize
3. IF a parcela informada não possuir eventos registrados, THEN THE Sistema_Historico SHALL retornar uma lista vazia com metadados de paginação

### Requisito 7: Integridade e Imutabilidade do Histórico

**User Story:** Como um gestor financeiro, eu quero que o histórico financeiro seja imutável e confiável, para que eu possa utilizá-lo como trilha de auditoria em processos de conferência e compliance.

#### Critérios de Aceitação

1. THE Sistema_Historico SHALL registrar eventos de forma append-only, sem permitir edição ou exclusão de eventos existentes
2. THE Sistema_Historico SHALL registrar o createdAt de cada evento com timestamp do momento exato da inserção no banco de dados
3. IF uma tentativa de atualização ou exclusão de um evento é realizada, THEN THE Sistema_Historico SHALL rejeitar a operação e retornar erro informando que o histórico é imutável
4. THE Sistema_Historico SHALL garantir que cada evento possua um id único gerado automaticamente

### Requisito 8: Integração com Módulos Existentes

**User Story:** Como um operador financeiro, eu quero que o histórico seja alimentado automaticamente pelos módulos de baixas financeiras, estornos e parcelas, para que o registro ocorra de forma transparente sem alterar os fluxos existentes.

#### Critérios de Aceitação

1. WHEN o módulo de baixas financeiras (financial-settlements) realiza uma baixa, THE Sistema_Historico SHALL ser notificado e registrar o evento correspondente dentro da mesma transação
2. WHEN o módulo de estornos financeiros realiza um estorno, THE Sistema_Historico SHALL ser notificado e registrar o evento correspondente dentro da mesma transação
3. WHEN o módulo de parcelas (installments) gera ou cancela parcelas, THE Sistema_Historico SHALL ser notificado e registrar o evento correspondente dentro da mesma transação
4. THE Sistema_Historico SHALL expor um serviço (FinancialHistoryService) que os módulos existentes possam invocar para registrar eventos
5. IF o registro do evento no histórico falhar, THEN THE Sistema_Historico SHALL propagar o erro causando rollback da transação principal para garantir consistência
