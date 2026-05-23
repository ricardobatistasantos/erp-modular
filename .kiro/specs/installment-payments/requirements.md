# Requirements Document

## Introduction

Refatoração dos módulos de Contas a Pagar e Contas a Receber para integrar nativamente o suporte a parcelamentos. Atualmente, a geração de parcelas é um processo separado que exige uma chamada adicional à API após a criação da conta. Esta feature unifica o fluxo, permitindo que o usuário informe os dados de parcelamento diretamente na criação da conta, gerando as parcelas automaticamente. Além disso, adiciona suporte a parcelamentos com valores personalizados por parcela e recalculação de parcelas quando o valor total da conta é alterado.

## Glossary

- **Sistema_Contas_Pagar**: Módulo responsável pelo gerenciamento de contas a pagar (despesas e obrigações financeiras)
- **Sistema_Contas_Receber**: Módulo responsável pelo gerenciamento de contas a receber (receitas e créditos financeiros)
- **Sistema_Parcelas**: Módulo responsável pela geração, consulta e gerenciamento de parcelas vinculadas a contas
- **Parcela**: Fração de um valor total de uma conta, com data de vencimento e valor próprios
- **Parcelamento**: Configuração que define como o valor total de uma conta será dividido em parcelas
- **Conta_Origem**: Conta a pagar ou conta a receber que origina as parcelas
- **Intervalo_Meses**: Período em meses entre os vencimentos de parcelas consecutivas
- **Distribuição_Proporcional**: Método de divisão do valor total em parcelas iguais, com ajuste de centavos na última parcela
- **Distribuição_Personalizada**: Método de divisão do valor total em parcelas com valores definidos individualmente pelo usuário
- **Status_Conta**: Estado atual da conta (PENDENTE, PARCIAL, PAGO/RECEBIDO, CANCELADO)
- **Status_Parcela**: Estado atual da parcela (PENDENTE, PARCIAL, PAGO, CANCELADO)

## Requirements

### Requirement 1: Criação de Conta a Pagar com Parcelamento Automático

**User Story:** Como um operador financeiro, eu quero criar uma conta a pagar já informando os dados de parcelamento, para que as parcelas sejam geradas automaticamente sem necessidade de uma segunda chamada à API.

#### Acceptance Criteria

1. WHEN o operador envia uma requisição de criação de conta a pagar com o campo `parcelamento` preenchido, THE Sistema_Contas_Pagar SHALL criar a conta com Status_Conta PENDENTE e gerar as parcelas correspondentes com Status_Parcela PENDENTE, numeradas sequencialmente a partir de 1, em uma única transação atômica
2. WHEN o campo `parcelamento` não é informado na criação, THE Sistema_Contas_Pagar SHALL criar a conta com Status_Conta PENDENTE e uma única parcela com Status_Parcela PENDENTE, número 1, o valor total da conta e a mesma data de vencimento da conta
3. IF o campo `parcelamento.quantidadeParcelas` é menor que 1 ou maior que 360, THEN THE Sistema_Contas_Pagar SHALL rejeitar a requisição com erro de validação informando que a quantidade deve estar entre 1 e 360
4. WHEN o campo `parcelamento.quantidadeParcelas` é informado sem `parcelamento.valores`, THE Sistema_Contas_Pagar SHALL gerar parcelas utilizando Distribuição_Proporcional do valor total, calculando as datas de vencimento conforme o Intervalo_Meses a partir da data de vencimento da conta
5. WHEN o campo `parcelamento.valores` é informado sem `parcelamento.datasVencimento`, THE Sistema_Contas_Pagar SHALL gerar parcelas com os valores individuais especificados e calcular as datas de vencimento conforme o Intervalo_Meses a partir da data de vencimento da conta
6. IF a soma dos valores em `parcelamento.valores` não é exatamente igual ao valor total da conta, THEN THE Sistema_Contas_Pagar SHALL rejeitar a requisição com erro informando a divergência entre a soma das parcelas e o valor total
7. IF a quantidade de itens em `parcelamento.valores` diverge de `parcelamento.quantidadeParcelas`, THEN THE Sistema_Contas_Pagar SHALL rejeitar a requisição com erro informando a inconsistência
8. IF o valor total da conta informado é menor ou igual a zero, THEN THE Sistema_Contas_Pagar SHALL rejeitar a requisição com erro de validação informando que o valor deve ser maior que zero

### Requirement 2: Criação de Conta a Receber com Parcelamento Automático

**User Story:** Como um operador financeiro, eu quero criar uma conta a receber já informando os dados de parcelamento, para que as parcelas sejam geradas automaticamente sem necessidade de uma segunda chamada à API.

#### Acceptance Criteria

1. WHEN o operador envia uma requisição de criação de conta a receber com o campo `parcelamento` preenchido, THE Sistema_Contas_Receber SHALL criar a conta com Status_Conta PENDENTE e gerar as parcelas correspondentes com Status_Parcela PENDENTE em uma única transação atômica
2. WHEN o campo `parcelamento` não é informado na criação, THE Sistema_Contas_Receber SHALL criar a conta com Status_Conta PENDENTE e uma única parcela com Status_Parcela PENDENTE, com o valor total e a mesma data de vencimento da conta
3. IF o campo `parcelamento.quantidadeParcelas` é menor que 1 ou maior que 360, THEN THE Sistema_Contas_Receber SHALL rejeitar a requisição com erro de validação informando que a quantidade deve ser entre 1 e 360
4. WHEN o campo `parcelamento.quantidadeParcelas` é informado sem `parcelamento.valores`, THE Sistema_Contas_Receber SHALL gerar parcelas utilizando Distribuição_Proporcional do valor total
5. WHEN o campo `parcelamento.valores` é informado, THE Sistema_Contas_Receber SHALL gerar parcelas com os valores individuais especificados
6. IF a soma dos valores em `parcelamento.valores` não é igual ao valor total da conta (comparação exata em centavos), THEN THE Sistema_Contas_Receber SHALL rejeitar a requisição com erro informando a divergência entre a soma das parcelas e o valor total
7. IF a quantidade de itens em `parcelamento.valores` diverge de `parcelamento.quantidadeParcelas`, THEN THE Sistema_Contas_Receber SHALL rejeitar a requisição com erro informando a inconsistência
8. IF o campo `valor` da conta é menor ou igual a zero, THEN THE Sistema_Contas_Receber SHALL rejeitar a requisição com erro de validação informando que o valor deve ser maior que zero

### Requirement 3: Cálculo de Parcelas com Distribuição Proporcional

**User Story:** Como um operador financeiro, eu quero que o sistema distribua o valor total igualmente entre as parcelas, para que não haja diferença de centavos entre o valor total e a soma das parcelas.

#### Acceptance Criteria

1. THE Sistema_Parcelas SHALL calcular o valor base de cada parcela dividindo o valor total pela quantidade de parcelas (máximo de 360 parcelas), truncando o resultado em duas casas decimais
2. THE Sistema_Parcelas SHALL atribuir o resíduo (diferença entre valor total e soma dos valores base) à última parcela, somando o resíduo ao valor base dessa parcela
3. THE Sistema_Parcelas SHALL garantir que a soma dos valores de todas as parcelas geradas com Distribuição_Proporcional seja exatamente igual ao valor total da Conta_Origem
4. IF o Intervalo_Meses não é informado, THEN THE Sistema_Parcelas SHALL utilizar o valor padrão de 1 mês entre vencimentos consecutivos
5. THE Sistema_Parcelas SHALL calcular a data de vencimento de cada parcela adicionando (número da parcela - 1) multiplicado pelo Intervalo_Meses à data de vencimento da Conta_Origem, onde a adição de meses que ultrapasse o último dia do mês resultante SHALL utilizar o último dia válido desse mês (ex: 31/01 + 1 mês = 28/02)
6. IF o valor total dividido pela quantidade de parcelas resulta em valor base inferior a R$ 0,01 por parcela, THEN THE Sistema_Parcelas SHALL rejeitar a operação com erro informando que o valor total é insuficiente para a quantidade de parcelas solicitada

### Requirement 4: Cálculo de Parcelas com Distribuição Personalizada

**User Story:** Como um operador financeiro, eu quero informar valores individuais para cada parcela, para que eu possa definir planos de pagamento com valores variáveis (ex: entrada maior).

#### Acceptance Criteria

1. WHEN o campo `parcelamento.valores` contém uma lista de valores, THE Sistema_Parcelas SHALL criar cada parcela com o valor correspondente na posição da lista, onde cada valor representa o montante em reais com até duas casas decimais
2. WHEN o campo `parcelamento.datasVencimento` contém uma lista de datas, THE Sistema_Parcelas SHALL criar cada parcela com a data de vencimento correspondente na posição da lista
3. WHEN o campo `parcelamento.valores` é informado sem `parcelamento.datasVencimento`, THE Sistema_Parcelas SHALL calcular as datas de vencimento de cada parcela utilizando o Intervalo_Meses a partir da data de vencimento da Conta_Origem
4. IF algum valor em `parcelamento.valores` é menor ou igual a zero, THEN THE Sistema_Parcelas SHALL rejeitar a requisição com erro informando que todos os valores devem ser maiores que zero
5. IF alguma data em `parcelamento.datasVencimento` é anterior à data de emissão da conta, THEN THE Sistema_Parcelas SHALL rejeitar a requisição com erro informando que as datas de vencimento devem ser iguais ou posteriores à data de emissão
6. IF a quantidade de itens em `parcelamento.datasVencimento` diverge de `parcelamento.quantidadeParcelas`, THEN THE Sistema_Parcelas SHALL rejeitar a requisição com erro informando a inconsistência entre a quantidade de datas e a quantidade de parcelas
7. WHEN o campo `parcelamento.datasVencimento` é informado sem `parcelamento.valores`, THE Sistema_Parcelas SHALL gerar os valores das parcelas utilizando Distribuição_Proporcional do valor total da Conta_Origem

### Requirement 5: Recalculação de Parcelas ao Alterar Valor da Conta

**User Story:** Como um operador financeiro, eu quero que ao alterar o valor total de uma conta, as parcelas pendentes sejam recalculadas proporcionalmente, para manter a consistência entre o valor da conta e suas parcelas.

#### Acceptance Criteria

1. WHEN o valor total de uma conta é alterado e existem parcelas vinculadas, THE Sistema_Parcelas SHALL recalcular os valores das parcelas com status PENDENTE utilizando Distribuição_Proporcional para redistribuir o valor restante (novo valor total menos a soma de valorPago de todas as parcelas não canceladas)
2. IF existem parcelas com status PAGO ou PARCIAL vinculadas à conta, THEN THE Sistema_Parcelas SHALL manter o valor e o valorPago dessas parcelas inalterados e redistribuir o valor restante apenas entre as parcelas com status PENDENTE
3. IF o novo valor total da conta é menor que a soma de valorPago de todas as parcelas não canceladas (PAGO e PARCIAL), THEN THE Sistema_Parcelas SHALL rejeitar a alteração com erro informando que o novo valor não pode ser inferior ao valor já liquidado
4. THE Sistema_Parcelas SHALL executar a alteração de valor e recalculação de parcelas em uma única transação atômica
5. WHEN a recalculação é executada, THE Sistema_Parcelas SHALL preservar as datas de vencimento originais das parcelas PENDENTES e recalcular apenas os valores monetários
6. IF não existem parcelas com status PENDENTE vinculadas à conta no momento da alteração, THEN THE Sistema_Parcelas SHALL rejeitar a alteração com erro informando que não há parcelas pendentes disponíveis para redistribuição

### Requirement 6: Regeneração de Parcelas

**User Story:** Como um operador financeiro, eu quero poder regenerar as parcelas de uma conta (alterar quantidade ou configuração), para corrigir erros ou ajustar o plano de pagamento.

#### Acceptance Criteria

1. WHEN o operador solicita regeneração de parcelas para uma conta informando nova quantidade de parcelas e opcionalmente novos valores individuais, intervalo de meses ou datas de vencimento, THE Sistema_Parcelas SHALL cancelar todas as parcelas com status PENDENTE e gerar novas parcelas aplicando as mesmas regras de Distribuição_Proporcional ou Distribuição_Personalizada conforme os parâmetros informados
2. IF existem parcelas com status PAGO ou PARCIAL vinculadas à conta, THEN THE Sistema_Parcelas SHALL manter essas parcelas inalteradas e gerar novas parcelas apenas para o valor restante, calculado como o valor total da Conta_Origem menos a soma do campo valorPago de todas as parcelas com status PAGO ou PARCIAL
3. IF existem baixas financeiras vinculadas a parcelas PENDENTES, THEN THE Sistema_Parcelas SHALL rejeitar a regeneração com erro informando que existem baixas vinculadas
4. IF não existem parcelas com status PENDENTE vinculadas à conta, THEN THE Sistema_Parcelas SHALL rejeitar a regeneração com erro informando que não há parcelas pendentes para regenerar
5. THE Sistema_Parcelas SHALL executar o cancelamento das parcelas antigas e a criação das novas em uma única transação atômica
6. WHEN a regeneração é concluída, THE Sistema_Parcelas SHALL derivar o status da Conta_Origem conforme as seguintes regras: PENDENTE se nenhuma parcela ativa possui pagamento, PARCIAL se ao menos uma parcela ativa possui status PAGO ou PARCIAL mas não todas, e PAGO/RECEBIDO se todas as parcelas ativas possuem status PAGO

### Requirement 7: Consulta de Parcelas com Informações de Parcelamento

**User Story:** Como um operador financeiro, eu quero consultar as parcelas de uma conta com informações resumidas do parcelamento, para ter visibilidade do plano de pagamento completo.

#### Acceptance Criteria

1. WHEN o operador consulta as parcelas de uma conta por origemId, THE Sistema_Parcelas SHALL retornar a lista de parcelas ordenadas por número da parcela em ordem crescente, incluindo um objeto de resumo do parcelamento
2. THE Sistema_Parcelas SHALL incluir no resumo: valor total da conta (soma do campo valor de todas as parcelas), quantidade total de parcelas, quantidade de parcelas com status "PAGO", valor total pago (soma do campo valorPago de todas as parcelas) e valor restante (valor total da conta menos valor total pago)
3. WHEN o operador consulta uma conta a pagar por ID, THE Sistema_Contas_Pagar SHALL incluir na resposta as informações resumidas do parcelamento vinculado, calculadas a partir das parcelas com origemId igual ao ID da conta
4. WHEN o operador consulta uma conta a receber por ID, THE Sistema_Contas_Receber SHALL incluir na resposta as informações resumidas do parcelamento vinculado, calculadas a partir das parcelas com origemId igual ao ID da conta
5. IF a conta consultada não possuir parcelas vinculadas, THEN THE Sistema SHALL retornar o resumo do parcelamento com valores zerados (valor total 0, quantidade total 0, quantidade pagas 0, valor total pago 0, valor restante 0)
6. THE Sistema_Parcelas SHALL incluir parcelas com status "CANCELADO" na listagem, porém excluí-las dos cálculos do resumo (valor total, quantidade total de parcelas, valor total pago e valor restante)

### Requirement 8: Validações de Integridade do Parcelamento

**User Story:** Como um operador financeiro, eu quero que o sistema garanta a integridade dos dados de parcelamento, para evitar inconsistências financeiras.

#### Acceptance Criteria

1. WHEN qualquer operação de criação, recalculação, regeneração ou cancelamento de parcelas é concluída, THE Sistema_Parcelas SHALL validar que a soma dos valores de todas as parcelas ativas (não canceladas) seja exatamente igual ao valor total da Conta_Origem, comparando valores com precisão de duas casas decimais
2. IF uma operação de escrita resulta em divergência (diferença diferente de zero) entre a soma das parcelas ativas e o valor total da conta, THEN THE Sistema_Parcelas SHALL reverter a transação inteira e retornar erro informando o valor total esperado, a soma calculada das parcelas ativas e a diferença encontrada
3. THE Sistema_Parcelas SHALL atribuir números de parcela iniciando em 1, incrementando sequencialmente em 1, garantindo unicidade dentro de uma mesma Conta_Origem
4. IF uma parcela é cancelada, THEN THE Sistema_Parcelas SHALL manter a numeração original das demais parcelas sem renumerar
5. IF uma operação tenta criar uma parcela com número duplicado dentro da mesma Conta_Origem, THEN THE Sistema_Parcelas SHALL rejeitar a operação e retornar erro informando o número da parcela duplicado e o identificador da Conta_Origem
