# Requirements Document

## Introduction

Este documento define os requisitos para a funcionalidade de atualização de colaborador (employee) no módulo de pessoas do ERP modular. A funcionalidade segue o mesmo padrão transacional já implementado no módulo de cliente (UpdateClientUseCase), permitindo a atualização parcial dos dados pessoais, cargo, departamento e perfil de vendedor de um colaborador existente.

## Glossary

- **Sistema**: O módulo de colaborador (employee) do ERP modular NestJS
- **Colaborador**: Entidade que representa um funcionário, vinculada a uma pessoa (tabela `colaborador`)
- **Pessoa**: Entidade base que armazena dados comuns como nome, email, tipo (tabela `pessoa`)
- **Pessoa_Fisica**: Dados de pessoa física vinculados a uma pessoa (CPF)
- **Pessoa_Juridica**: Dados de pessoa jurídica vinculados a uma pessoa (CNPJ)
- **Cargo**: Posição/função do colaborador com nome e salário (tabela `cargo`)
- **Departamento**: Setor organizacional do colaborador (tabela `departamento`)
- **Vendedor**: Perfil de vendas opcional do colaborador com comissão e meta (tabela `vendedor`)
- **Contato**: Telefone de contato vinculado a uma pessoa (tabela `pessoa_contato`)
- **Endereco**: Endereço vinculado a uma pessoa (tabela `pessoa_endereco`)
- **Transacao**: Operação atômica no banco de dados que garante consistência (pg-promise transaction)
- **UpdateEmployeeDTO**: Objeto de transferência de dados para atualização do colaborador
- **Controller**: Camada de apresentação que expõe o endpoint HTTP PUT
- **UseCase**: Camada de aplicação que orquestra a lógica de negócio

## Requirements

### Requirement 1: Endpoint HTTP para Atualização de Colaborador

**User Story:** Como um usuário do sistema, eu quero atualizar os dados de um colaborador existente via API REST, para que eu possa manter as informações do colaborador atualizadas.

#### Acceptance Criteria

1. WHEN uma requisição PUT é recebida no path `/employee/:id`, THE Controller SHALL extrair o parâmetro `id` da rota e o corpo da requisição, e delegar a execução para o UpdateEmployeeUseCase passando um objeto com o `id` e os dados de atualização (updateData)
2. WHEN o UpdateEmployeeUseCase retorna o colaborador atualizado com sucesso, THE Controller SHALL responder com status HTTP 200 e o objeto completo do colaborador atualizado no corpo da resposta
3. IF o UpdateEmployeeUseCase lança uma NotFoundException (colaborador com o ID informado não existe), THEN THE Controller SHALL responder com status HTTP 404 e uma mensagem indicando que o colaborador não foi encontrado
4. IF o parâmetro `id` da rota é um UUID inválido ou o corpo da requisição não corresponde à estrutura esperada pelo UpdateEmployeeDTO, THEN THE Controller SHALL responder com status HTTP 400

### Requirement 2: Validação de Existência do Colaborador

**User Story:** Como um usuário do sistema, eu quero receber um erro claro quando tento atualizar um colaborador inexistente, para que eu saiba que o ID informado é inválido.

#### Acceptance Criteria

1. WHEN o UpdateEmployeeUseCase recebe um ID para atualização, THE Sistema SHALL buscar o colaborador pelo ID utilizando IEmployeeRepository.findById(id)
2. IF o colaborador não é encontrado no repositório (findById retorna null), THEN THE Sistema SHALL lançar uma NotFoundException com a mensagem "Colaborador não encontrado"
3. WHEN o colaborador é encontrado, THE Sistema SHALL extrair o personId do colaborador encontrado e utilizá-lo como referência para as operações de atualização de pessoa nas etapas seguintes do fluxo
4. IF o ID informado for nulo, indefinido ou uma string vazia, THEN THE Sistema SHALL lançar uma exceção de validação antes de consultar o repositório

### Requirement 3: Atualização Transacional dos Dados

**User Story:** Como um administrador do sistema, eu quero que todas as atualizações do colaborador ocorram de forma atômica, para que dados parciais não sejam persistidos em caso de falha.

#### Acceptance Criteria

1. WHEN o UpdateEmployeeUseCase executa a atualização, THE Sistema SHALL encapsular todas as operações de escrita (pessoa, pessoa física/jurídica, contatos, endereços e dados do colaborador) em uma única transação de banco de dados utilizando connection().tx()
2. IF qualquer operação dentro da transação lança uma exceção, THEN THE Sistema SHALL reverter automaticamente todas as alterações realizadas na transação e propagar a exceção para o chamador
3. IF o colaborador informado não é encontrado antes de iniciar a transação, THEN THE Sistema SHALL lançar uma exceção do tipo NotFoundException sem iniciar a transação
4. WHEN a transação é concluída com sucesso (commit realizado), THE Sistema SHALL retornar a entidade completa do colaborador consultando o repositório pelo ID após o commit da transação

### Requirement 4: Atualização dos Dados de Pessoa

**User Story:** Como um usuário do sistema, eu quero atualizar os dados pessoais (nome, email, observação) de um colaborador, para que as informações cadastrais fiquem corretas.

#### Acceptance Criteria

1. WHEN o campo `pessoa` está presente no UpdateEmployeeDTO, THE Sistema SHALL atualizar os dados da pessoa (nome, email, observacao) usando o pessoa_id do colaborador dentro da transação, aplicando apenas os campos fornecidos e mantendo os demais inalterados via COALESCE
2. WHEN o campo `pessoa.tipo` é 'F' e `pessoa.fisica` está presente, THE Sistema SHALL atualizar o CPF (máximo 14 caracteres com máscara, armazenado como 11 dígitos numéricos) na tabela pessoa_fisica vinculada ao pessoa_id dentro da mesma transação
3. WHEN o campo `pessoa.tipo` é 'J' e `pessoa.juridica` está presente, THE Sistema SHALL atualizar o CNPJ (máximo 18 caracteres com máscara, armazenado como 14 dígitos numéricos) na tabela pessoa_juridica vinculada ao pessoa_id dentro da mesma transação
4. WHEN o campo `pessoa` não está presente no UpdateEmployeeDTO, THE Sistema SHALL manter os dados de pessoa inalterados sem executar nenhuma operação de atualização nas tabelas pessoa, pessoa_fisica ou pessoa_juridica
5. IF a atualização de qualquer campo de pessoa falhar durante a transação (erro de banco, registro não encontrado para o pessoa_id), THEN THE Sistema SHALL realizar rollback de todas as alterações da transação e retornar uma mensagem de erro indicando a falha na atualização dos dados de pessoa
6. IF o campo `pessoa.tipo` é 'F' e `pessoa.fisica` não está presente, ou `pessoa.tipo` é 'J' e `pessoa.juridica` não está presente, THEN THE Sistema SHALL atualizar apenas os dados da tabela pessoa (nome, email, observacao) sem modificar as tabelas pessoa_fisica ou pessoa_juridica
7. WHEN o campo `pessoa.nome` é fornecido, THE Sistema SHALL validar que o nome possui no máximo 255 caracteres e não é uma string vazia antes de persistir a atualização

### Requirement 5: Substituição de Contatos

**User Story:** Como um usuário do sistema, eu quero atualizar a lista de contatos de um colaborador, para que os telefones cadastrados estejam sempre corretos.

#### Acceptance Criteria

1. WHEN o campo `pessoa.contatos` está presente no UpdateEmployeeDTO (incluindo array vazio `[]`), THE Sistema SHALL remover todos os contatos existentes vinculados ao pessoa_id dentro da transação
2. WHEN os contatos existentes são removidos e o array `pessoa.contatos` contém de 1 até 20 itens, THE Sistema SHALL criar os novos contatos fornecidos no array vinculados ao pessoa_id dentro da transação
3. WHEN o campo `pessoa.contatos` não está presente (undefined) no UpdateEmployeeDTO, THE Sistema SHALL manter os contatos existentes inalterados
4. IF a criação de qualquer contato falhar durante a transação, THEN THE Sistema SHALL realizar rollback de todas as operações da transação (incluindo a remoção dos contatos anteriores) e retornar uma mensagem de erro indicando a falha na atualização dos contatos

### Requirement 6: Substituição de Endereços

**User Story:** Como um usuário do sistema, eu quero atualizar a lista de endereços de um colaborador, para que os endereços cadastrados estejam sempre corretos.

#### Acceptance Criteria

1. WHEN o campo `pessoa.enderecos` está presente no UpdateEmployeeDTO com um array contendo 1 ou mais elementos, THE Sistema SHALL remover todos os endereços existentes vinculados ao pessoa_id e criar os novos endereços fornecidos no array vinculados ao mesmo pessoa_id, ambas operações dentro da mesma transação de banco de dados
2. WHEN o campo `pessoa.enderecos` está presente no UpdateEmployeeDTO com um array vazio (0 elementos), THE Sistema SHALL remover todos os endereços existentes vinculados ao pessoa_id dentro da transação, resultando em nenhum endereço cadastrado
3. WHEN o campo `pessoa.enderecos` não está presente (undefined) no UpdateEmployeeDTO, THE Sistema SHALL manter os endereços existentes inalterados sem executar operações de remoção ou criação
4. IF ocorrer uma falha durante a remoção ou criação de endereços dentro da transação, THEN THE Sistema SHALL realizar rollback de todas as operações da transação, mantendo os endereços anteriores inalterados
5. WHEN os novos endereços são criados, THE Sistema SHALL persistir cada endereço com todos os campos obrigatórios do AddressDTO (logradouro, numero, bairro, cidade, uf, cep, tipoEndereco) vinculados ao pessoa_id

### Requirement 7: Atualização dos Dados Específicos do Colaborador

**User Story:** Como um usuário do sistema, eu quero atualizar os dados específicos do colaborador (matrícula, cargo, departamento), para que a estrutura organizacional reflita a realidade.

#### Acceptance Criteria

1. WHEN o campo `colaborador` está presente no UpdateEmployeeDTO com `matricula` informada, THE Sistema SHALL atualizar o campo matricula (máximo 10 caracteres) na tabela `colaborador` e atualizar cargo_id e departamento_id somente se os respectivos sub-objetos `cargo` e `departamento` estiverem presentes, dentro da transação
2. WHEN o campo `colaborador.cargo` está presente com dados de cargo e o colaborador já possui um cargo vinculado (cargo_id não nulo), THE Sistema SHALL atualizar o registro de cargo existente (nome, salario) vinculado ao colaborador dentro da transação
3. WHEN o campo `colaborador.departamento` está presente com dados de departamento e o colaborador já possui um departamento vinculado (departamento_id não nulo), THE Sistema SHALL atualizar o registro de departamento existente (nome) vinculado ao colaborador dentro da transação
4. WHEN o campo `colaborador` não está presente no UpdateEmployeeDTO, THE Sistema SHALL manter os dados específicos do colaborador inalterados
5. IF o campo `colaborador.cargo` está presente mas o colaborador não possui cargo vinculado (cargo_id nulo), THEN THE Sistema SHALL criar um novo registro na tabela `cargo` com os dados fornecidos e vincular o cargo_id ao colaborador dentro da transação
6. IF o campo `colaborador.departamento` está presente mas o colaborador não possui departamento vinculado (departamento_id nulo), THEN THE Sistema SHALL criar um novo registro na tabela `departamento` com os dados fornecidos e vincular o departamento_id ao colaborador dentro da transação
7. IF a atualização da matricula viola a restrição de unicidade (matricula já existente para outro colaborador), THEN THE Sistema SHALL reverter a transação e lançar um erro indicando que a matrícula informada já está em uso

### Requirement 8: Atualização do Perfil de Vendedor

**User Story:** Como um usuário do sistema, eu quero atualizar ou criar o perfil de vendedor de um colaborador, para que as metas e comissões estejam configuradas corretamente.

#### Acceptance Criteria

1. WHEN o campo `colaborador.vendedor` está presente no UpdateEmployeeDTO e o colaborador já possui um perfil de vendedor, THE Sistema SHALL atualizar os campos comissao e meta_venda na tabela `vendedor` com os valores informados, dentro da transação corrente
2. WHEN o campo `colaborador.vendedor` está presente no UpdateEmployeeDTO e o colaborador não possui um perfil de vendedor, THE Sistema SHALL criar um novo registro na tabela `vendedor` com os campos comissao e meta_venda vinculado ao colaborador_id, dentro da transação corrente
3. WHEN o campo `colaborador.vendedor` não está presente no UpdateEmployeeDTO, THE Sistema SHALL manter o perfil de vendedor existente inalterado, sem realizar nenhuma operação na tabela `vendedor`
4. IF o campo `colaborador.vendedor` está presente e o valor de comissao ou meta_venda for menor que 0 ou maior que 999999999999.999999, THEN THE Sistema SHALL rejeitar a operação e retornar uma mensagem de erro indicando que os valores devem estar entre 0 e 999999999999.999999
5. IF a operação de criação ou atualização do perfil de vendedor falhar durante a transação, THEN THE Sistema SHALL realizar rollback de toda a transação de atualização do colaborador, preservando o estado anterior dos dados

### Requirement 9: Estrutura do DTO de Atualização

**User Story:** Como um desenvolvedor, eu quero um DTO bem definido para a atualização de colaborador, para que a validação dos dados de entrada seja clara e consistente.

#### Acceptance Criteria

1. THE UpdateEmployeeDTO SHALL aceitar um campo opcional `pessoa` contendo: nome (string opcional, máximo 150 caracteres), email (string opcional, máximo 200 caracteres, formato válido de email), observacao (string opcional, máximo 500 caracteres), tipo ('F' ou 'J'), fisica (FisicaDTO opcional), juridica (JuridicaDTO opcional), contatos (array de ContactDTO opcional, máximo 20 itens), enderecos (array de AddressDTO opcional, máximo 10 itens)
2. THE UpdateEmployeeDTO SHALL aceitar um campo opcional `colaborador` contendo: matricula (string opcional, máximo 20 caracteres), dataAdmissao (Date opcional), dataDemissao (Date opcional), cargo (objeto com nome string máximo 100 caracteres e salario number entre 0.01 e 999999.99, opcional), departamento (objeto com nome string máximo 100 caracteres, opcional), vendedor (objeto com comissao number entre 0 e 100 e metaVendas number entre 0.01 e 999999999.99, opcional)
3. THE UpdateEmployeeDTO SHALL permitir atualização parcial, onde campos não fornecidos no nível raiz (`pessoa`, `colaborador`) ou dentro de cada objeto mantêm seus valores atuais, e campos de array (`contatos`, `enderecos`) quando fornecidos substituem o array completo existente
4. IF o campo `pessoa.tipo` for 'F', THEN THE UpdateEmployeeDTO SHALL aceitar apenas `pessoa.fisica` e rejeitar `pessoa.juridica`; IF o campo `pessoa.tipo` for 'J', THEN THE UpdateEmployeeDTO SHALL aceitar apenas `pessoa.juridica` e rejeitar `pessoa.fisica`
5. IF o UpdateEmployeeDTO receber campos com valores que violam as regras de validação (formato, tipo de dado, ou limites definidos), THEN THE sistema SHALL rejeitar a requisição com uma mensagem de erro indicando quais campos falharam na validação

### Requirement 10: Registro do UseCase no Módulo

**User Story:** Como um desenvolvedor, eu quero que o UpdateEmployeeUseCase esteja registrado no módulo NestJS, para que a injeção de dependências funcione corretamente.

#### Acceptance Criteria

1. THE Sistema SHALL registrar o UpdateEmployeeUseCase como classe direta no array de providers do EmployeeModule, seguindo o mesmo padrão dos demais use cases já registrados (CreateEmployeeUseCase, GetByIdeEUseCase, FindAllEmployeesUseCase)
2. THE Sistema SHALL injetar o UpdateEmployeeUseCase no constructor do EmployeeController como parâmetro `private readonly updateEmployeeUseCase: UpdateEmployeeUseCase`, seguindo o padrão de injeção do ClientController
3. THE IEmployeeRepository SHALL expor um método `update(id: string, data: any, transaction?: any): Promise<any>` na interface, seguindo a mesma assinatura definida na IClientRepository
4. WHEN o EmployeeModule for carregado pelo NestJS, THE Sistema SHALL resolver todas as dependências do UpdateEmployeeUseCase sem erros de injeção, garantindo que o token 'IEmployeeRepository' utilizado pelo use case esteja mapeado para a classe EmployeeRepository no array de providers

### Requirement 11: Retorno dos Dados Atualizados

**User Story:** Como um usuário do sistema, eu quero receber os dados completos do colaborador após a atualização, para que eu possa confirmar que as alterações foram aplicadas.

#### Acceptance Criteria

1. WHEN a transação de atualização é concluída com sucesso, THE Sistema SHALL consultar o colaborador atualizado pelo ID usando o método findById do repositório fora do escopo da transação
2. WHEN o método findById retorna o colaborador, THE Sistema SHALL retornar o objeto contendo os campos: id, pessoa_id, matricula, admissao, demissao, nome, email, tipo, cargo_id, cargo_nome, cargo_salario, departamento_id, departamento_nome
3. IF o método findById retorna null após a transação concluída com sucesso, THEN THE Sistema SHALL lançar uma NotFoundException com mensagem indicando que o colaborador não foi encontrado
