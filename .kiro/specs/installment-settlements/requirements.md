# Requirements Document

## Introdução

Este documento define os requisitos para o recurso de **Parcelamento de Contas e Baixas Financeiras por Parcela**. O objetivo é permitir que contas a pagar e contas a receber sejam parceladas em múltiplas parcelas, e que as baixas financeiras (settlements) sejam realizadas individualmente por parcela, com suporte a juros, multa e desconto. Quando todas as parcelas de uma conta forem liquidadas, o status da conta-pai deve ser atualizado automaticamente.

## Glossário

- **Sistema_Parcelas**: Módulo responsável pela geração e gerenciamento de parcelas vinculadas a contas a pagar ou receber
- **Sistema_Baixas**: Módulo responsável pela execução de baixas financeiras (settlements) vinculadas a parcelas individuais
- **Conta_Pai**: Conta a pagar ou conta a receber que origina as parcelas
- **Parcela**: Subdivisão de uma conta em valores e datas de vencimento individuais
- **Baixa_Financeira**: Registro de pagamento ou recebimento efetivo de uma parcela
- **Valor_Liquido**: Valor final da baixa calculado como: valor_parcela + juros + multa - desconto
- **Parcela_Status**: Estado da parcela, podendo ser PENDENTE, PARCIAL, PAGO ou CANCELADO
- **Conta_Status**: Estado da conta-pai, podendo ser PENDENTE, PARCIAL, PAGO/RECEBIDO ou CANCELADO

## Requisitos

### Requisito 1: Geração de Parcelas

**User Story:** Como um operador financeiro, eu quero gerar parcelas ao criar ou editar uma conta a pagar/receber, para que eu possa dividir o valor total em pagamentos/recebimentos futuros com datas de vencimento distintas.

#### Critérios de Aceitação

1. WHEN uma conta a pagar ou receber é criada com quantidade de parcelas maior que 1, THE Sistema_Parcelas SHALL gerar automaticamente as parcelas com valores e datas de vencimento distribuídos
2. WHEN uma conta existente sem parcelas recebe uma solicitação de parcelamento, THE Sistema_Parcelas SHALL gerar as parcelas e vincular cada uma à Conta_Pai pelo origemId
3. THE Sistema_Parcelas SHALL atribuir a cada parcela um número sequencial (numeroParcela), o total de parcelas (totalParcelas), data de vencimento, valor individual e status inicial PENDENTE
4. THE Sistema_Parcelas SHALL garantir que a soma dos valores de todas as parcelas geradas seja igual ao valor total da Conta_Pai
5. WHEN o intervalo entre parcelas não é especificado, THE Sistema_Parcelas SHALL distribuir as datas de vencimento com intervalo mensal a partir da data de vencimento da Conta_Pai
6. IF a quantidade de parcelas informada for menor que 1, THEN THE Sistema_Parcelas SHALL retornar erro de validação com mensagem descritiva
7. IF a Conta_Pai já possuir parcelas com baixas realizadas, THEN THE Sistema_Parcelas SHALL rejeitar a re-geração de parcelas e retornar erro informando que existem baixas vinculadas

### Requisito 2: Baixa Financeira por Parcela

**User Story:** Como um operador financeiro, eu quero realizar baixas financeiras individualmente por parcela, para que eu tenha controle granular sobre cada pagamento/recebimento e possa registrar juros, multa e desconto por parcela.

#### Critérios de Aceitação

1. WHEN uma baixa é solicitada para uma parcela específica, THE Sistema_Baixas SHALL validar que a parcela existe e possui saldo pendente
2. WHEN uma baixa é solicitada, THE Sistema_Baixas SHALL calcular o Valor_Liquido como: valor informado + juros + multa - desconto
3. THE Sistema_Baixas SHALL registrar na baixa financeira os campos: parcelaId, valor, juros, multa, desconto, dataPagamento, formaPagamento, contaBancariaId, caixaId e observacao
4. WHEN a baixa é criada, THE Sistema_Baixas SHALL criar um lançamento financeiro (financial entry) correspondente com o Valor_Liquido
5. IF o Valor_Liquido exceder o saldo restante da parcela, THEN THE Sistema_Baixas SHALL rejeitar a operação e retornar erro informando o saldo disponível
6. WHEN a baixa é realizada com sucesso, THE Sistema_Baixas SHALL atualizar o valorPago da parcela e recalcular o status da parcela (PARCIAL se houver saldo restante, PAGO se quitada)
7. THE Sistema_Baixas SHALL executar todas as operações (criação de lançamento, registro de baixa, atualização de parcela e conta) dentro de uma única transação de banco de dados

### Requisito 3: Atualização Automática da Conta-Pai

**User Story:** Como um operador financeiro, eu quero que o status e os valores da conta-pai sejam atualizados automaticamente quando parcelas são liquidadas, para que eu tenha visibilidade consolidada do estado financeiro da conta.

#### Critérios de Aceitação

1. WHEN uma baixa de parcela é realizada, THE Sistema_Baixas SHALL recalcular o valorPago/valorRecebido da Conta_Pai como a soma dos valores pagos de todas as parcelas vinculadas
2. WHEN todas as parcelas de uma Conta_Pai atingem status PAGO, THE Sistema_Baixas SHALL atualizar o status da Conta_Pai para PAGO (contas a pagar) ou RECEBIDO (contas a receber)
3. WHILE existirem parcelas com status PENDENTE ou PARCIAL em uma Conta_Pai, THE Sistema_Baixas SHALL manter o status da Conta_Pai como PARCIAL
4. WHILE nenhuma parcela de uma Conta_Pai possuir baixa realizada, THE Sistema_Baixas SHALL manter o status da Conta_Pai como PENDENTE

### Requisito 4: Pagamento Parcial de Parcela

**User Story:** Como um operador financeiro, eu quero poder realizar pagamentos parciais em uma parcela individual, para que eu possa registrar recebimentos ou pagamentos que não cobrem o valor total da parcela.

#### Critérios de Aceitação

1. WHEN um valor menor que o saldo restante da parcela é informado na baixa, THE Sistema_Baixas SHALL registrar a baixa parcial e atualizar o status da parcela para PARCIAL
2. THE Sistema_Baixas SHALL permitir múltiplas baixas para a mesma parcela até que o saldo restante seja zero
3. WHEN o saldo restante da parcela atinge zero após uma baixa parcial, THE Sistema_Baixas SHALL atualizar o status da parcela para PAGO

### Requisito 5: Consulta de Parcelas e Baixas

**User Story:** Como um operador financeiro, eu quero consultar as parcelas de uma conta e as baixas de cada parcela, para que eu possa acompanhar o histórico de pagamentos e o saldo pendente.

#### Critérios de Aceitação

1. WHEN uma consulta por origemId é realizada, THE Sistema_Parcelas SHALL retornar todas as parcelas vinculadas à Conta_Pai ordenadas por numeroParcela
2. WHEN uma consulta por parcelaId é realizada, THE Sistema_Baixas SHALL retornar todas as baixas financeiras vinculadas à parcela ordenadas por dataPagamento
3. THE Sistema_Parcelas SHALL incluir na resposta de cada parcela o saldo restante calculado (valor - valorPago)
4. THE Sistema_Baixas SHALL incluir na resposta de cada baixa os valores de juros, multa e desconto aplicados

### Requisito 6: Expansão da Entidade Parcela

**User Story:** Como um operador financeiro, eu quero que a parcela registre o valor já pago, para que eu possa acompanhar o progresso de liquidação de cada parcela individualmente.

#### Critérios de Aceitação

1. THE Sistema_Parcelas SHALL manter na entidade parcela o campo valorPago representando a soma de todas as baixas realizadas para aquela parcela
2. THE Sistema_Parcelas SHALL manter o campo valorPago atualizado a cada nova baixa registrada na parcela
3. THE Sistema_Parcelas SHALL garantir que valorPago de uma parcela seja sempre menor ou igual ao valor da parcela

### Requisito 7: Vinculação da Baixa à Parcela

**User Story:** Como um operador financeiro, eu quero que a baixa financeira esteja vinculada diretamente à parcela (e não à conta), para que o rastreamento financeiro seja feito no nível mais granular.

#### Critérios de Aceitação

1. THE Sistema_Baixas SHALL registrar o parcelaId como referência principal na baixa financeira em vez do contaId direto
2. THE Sistema_Baixas SHALL manter o tipoConta (PAGAR/RECEBER) na baixa para identificar a natureza da operação
3. WHEN uma baixa é consultada, THE Sistema_Baixas SHALL permitir rastrear a Conta_Pai através da parcela vinculada
4. IF uma parcela com parcelaId informado não existir, THEN THE Sistema_Baixas SHALL retornar erro informando que a parcela não foi encontrada

### Requisito 8: Cancelamento de Parcelas

**User Story:** Como um operador financeiro, eu quero poder cancelar parcelas que não serão mais cobradas/pagas, para que eu possa ajustar o parcelamento quando houver renegociação.

#### Critérios de Aceitação

1. WHEN o cancelamento de uma parcela é solicitado, THE Sistema_Parcelas SHALL atualizar o status da parcela para CANCELADO
2. IF a parcela já possuir baixas financeiras vinculadas, THEN THE Sistema_Parcelas SHALL rejeitar o cancelamento e retornar erro informando que existem baixas realizadas
3. WHEN uma parcela é cancelada, THE Sistema_Parcelas SHALL recalcular o status da Conta_Pai considerando apenas as parcelas não canceladas
