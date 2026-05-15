LISTA DE TABELAS

PESSOAS

```sql
CREATE TYPE tipo_pessoa AS ENUM ('F', 'J'); -- J -> Jurídica f-> Física
create table if not exists pessoa(
  id uuid primary key default gen_random_uuid() not null,
  nome varchar(100) not null,
  email varchar(50) not null,
  tipo tipo_pessoa not null, 
  cliente int not null default 0,
  colaborador int not null default 0,
  transportadora int not null default 0,
  contador int not null default 0,
  observacao varchar(255) null,
  createdAt TIMESTAMP not null default now(),
  updatedAt TIMESTAMP null
);
CREATE UNIQUE INDEX idx_pessoa_email_unico ON pessoa(email);

create table if not exists pessoa_juridica(
  id uuid primary key default gen_random_uuid() not null,
  pessoa_id uuid references pessoa(id),
  cnpj varchar(14) not null
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_pessoa_juridica_cnpj_unico ON pessoa_juridica(cnpj);
CREATE INDEX IF NOT EXISTS idx_pessoa_juridica_pessoa_id ON pessoa_juridica(pessoa_id);

create table if not exists pessoa_fisica(
  id uuid primary key default gen_random_uuid() not null,
  pessoa_id uuid references pessoa(id) not null,
  cpf varchar(11) not null
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_pessoa_fisica_cpf_unico ON pessoa_fisica(cpf);
CREATE INDEX IF NOT EXISTS idx_pessoa_fisica_pessoa_id ON pessoa_fisica (pessoa_id);

CREATE TYPE tipo_contato AS ENUM ('PESSOAL', 'TRABALHO');
create table if not exists pessoa_contato(
  id uuid primary key default gen_random_uuid() not null,
  tipo_contato tipo_contato not null, 
  telefone varchar(20) not null,
  pessoa_id uuid references pessoa(id) not null
);
CREATE INDEX IF NOT EXISTS idx_pessoa_contato_pessoa_id ON pessoa_contato (pessoa_id);

CREATE TYPE tipo_pessoa_endereco AS ENUM ('RESIDENCIAL', 'TRABALHO');
create table if not exists pessoa_endereco(
  id uuid primary key default gen_random_uuid() not null,
  pessoa_id uuid references pessoa(id) not null,
  logradouro varchar(100) not null,
  numero varchar(10) not null,
  bairro varchar(100) not null,
  cidade varchar(100) not null,
  uf char(2) not null,
  cep varchar(8),
  tipo_endereco tipo_pessoa_endereco not null
);
CREATE INDEX IF NOT EXISTS idx_pessoa_endereco_pessoa_id ON pessoa_endereco (pessoa_id);

create table if not exists colaborador(
  id uuid primary key default gen_random_uuid() not null,
  pessoa_id uuid references pessoa(id) not null,
  matricula varchar(10) not null,
  admissao TIMESTAMP not null default now(),
  demissao TIMESTAMP null
);
CREATE INDEX IF NOT EXISTS idx_colaborador_pessoa_id ON colaborador(pessoa_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_colaborador_matricula_unico ON colaborador(matricula);

create table if not exists cliente(
  id uuid primary key default gen_random_uuid() not null,
  pessoa_id uuid references pessoa(id) not null,
  taxa_desconto decimal(8) null,
  limit_credito decimal(8) null
);
CREATE INDEX IF NOT EXISTS idx_cliente_pessoa_id ON cliente(pessoa_id);

create table if not exists vendedor(
  id uuid primary key default gen_random_uuid() not null,
  colaborador_id uuid references colaborador(id) not null,
  comissao decimal(18,6) not null,
  meta_venda decimal(18,6) not null
);

create table if not exists fornecedor(
  id uuid primary key default gen_random_uuid() not null,
  pessoa_id uuid references pessoa(id) not null
);

create table if not exists contador(
  id uuid primary key default gen_random_uuid() not null,
  pessoa_id uuid references pessoa(id) not null,
  crc_descricao varchar(8) not null,
  crc_uf char(2) not null
);

create table if not exists transportadora(
  id uuid primary key default gen_random_uuid() not null,
  pessoa_id uuid references pessoa(id) not null
);

-- FINANCEIRO
CREATE TYPE tipo_plano_contas AS ENUM ('SINTETICA','ANALITICA');
CREATE TYPE tipo_natureza AS ENUM ('RECEITA','DESPESA','ATIVO','PASSIVO','PATRIMONIO');
create table if not exists plano_contas(
  id uuid primary key,
  codigo varchar(20) not null,
  nome varchar(150) not null,
  tipo tipo_plano_contas not null,
  natureza tipo_natureza not null, 
  conta_pai_id uuid references plano_contas(id) null,
  aceita_lancamento boolean not null default true,
  ativo boolean not null default true,
  createdAt TIMESTAMP not null default now(),
  updatedAt TIMESTAMP null
);

create table if not exists centro_custos(
  id uuid primary key,
  codigo varchar(20) not null,
  nome varchar(150) not null,
  descricao text null,
  centro_pai_id uuid references centro_custos(id) null,
  ativo boolean not null default true,
  createdAt TIMESTAMP not null default now(),
  updatedAt TIMESTAMP null
);

create table if not exists categorias_financeiras(
  id uuid primary key,
  nome varchar(100) not null,
  descricao text null,
  tipo varchar(20) not null,
  plano_conta_id uuid references plano_contas(id) null,
  ativo boolean not null default true,
  createdAt TIMESTAMP not null default now(),
  updatedAt TIMESTAMP null
);

create table if not exists contas_receber(
  id uuid primary key,
  pessoa_id uuid not null,
  numero_documento varchar(50) not null,
  descricao varchar(255) not null,
  categoria_financeira_id uuid not null,
  centro_custo_id uuid null,
  conta_bancaria_id uuid null,
  data_emissao date not null,
  data_vencimento date not null,
  valor numeric(15,2) not null,
  valor_recebido numeric(15,2) not null default 0,
  status varchar(30) not null,
  forma_pagamento varchar(30) null,
  createdAt TIMESTAMP not null default now(),
  updatedAt TIMESTAMP null
);

create table if not exists contas_pagar(
  id uuid primary key,
  pessoa_id uuid not null,
  numero_documento varchar(50) not null,
  descricao varchar(255) not null,
  categoria_financeira_id uuid not null,
  centro_custo_id uuid null,
  conta_bancaria_id uuid null,
  data_emissao date not null,
  data_vencimento date not null,
  valor numeric(15,2) not null,
  valor_pago numeric(15,2) not null default 0,
  status varchar(30) not null,
  forma_pagamento varchar(30) null,
  createdAt TIMESTAMP not null default now(),
  updatedAt TIMESTAMP null
);

create table if not exists lancamentos_financeiros(
  id uuid primary key,
  tipo varchar(20) not null,
  origem varchar(50) not null,
  origem_id uuid not null,
  plano_conta_id uuid not null,
  centro_custo_id uuid null,
  conta_bancaria_id uuid null,
  caixa_id uuid null,
  data_lancamento timestamp not null,
  descricao varchar(255) not null,
  valor numeric(15,2) not null,
  saldo_anterior numeric(15,2) null,
  saldo_posterior numeric(15,2) null
);

create table if not exists parcelas(
  id uuid primary key,
  origem varchar(30) not null,
  origem_id uuid not null,
  numero_parcela integer not null,
  total_parcelas integer not null,
  data_vencimento date not null,
  valor numeric(15,2) not null,
  status varchar(30) not null,
  createdAt TIMESTAMP not null default now(),
  updatedAt TIMESTAMP null
);

CREATE TYPE tipo_baixas_financeiras AS ENUM ('RECEBER','PAGAR');
create table if not exists baixas_financeiras(
  id uuid primary key,
  tipo_conta tipo_baixas_financeiras not null,
  conta_id uuid not null,
  valor numeric(15,2) not null,
  data_pagamento timestamp not null,
  forma_pagamento varchar(30) not null,
  conta_bancaria_id uuid null,
  caixa_id uuid null,
  lancamento_financeiro_id uuid not null,
  observacao text null,
  createdAt TIMESTAMP not null default now(),
  updatedAt TIMESTAMP null
);

create table if not exists estornos_financeiros(
  id uuid primary key,
  baixa_id uuid not null,
  valor numeric(15,2) not null,
  motivo varchar(255) not null,
  lancamento_estorno_id uuid not null,
  createdAt TIMESTAMP not null default now(),
  updatedAt TIMESTAMP null
);

CREATE TYPE tipo_historico_contas AS ENUM ('RECEBER','PAGAR');
create table if not exists historico_contas(
  id uuid primary key,
  tipo_conta tipo_historico_contas not null,
  conta_id uuid not null,
  tipo_evento varchar(50) not null,
  status_anterior varchar(30) null,
  status_novo varchar(30) null,
  valor_anterior numeric(15,2) null,
  valor_novo numeric(15,2) null,
  descricao varchar(255) not null,
  usuario_id uuid null,
  createdAt TIMESTAMP not null default now(),
  updatedAt TIMESTAMP null
);

-- CAIXA
create table if not exists caixas();
create table if not exists fluxo_caixa_diario();

-- BANCOS
create table if not exists bancos();
create table if not exists contas_bancarias();
create table if not exists conciliacoes_bancarias();

-- DRE

create table if not exists produto(
  id uuid primary key default gen_random_uuid() not null,
  produto_sub_categoria_id uuid references produto_sub_categoria(id) not null,
  produto_unidade_medida_id uuid references produto_unidade_medida(id) not null,
  produto_marca_id uuid references produto_marca(id) not null,
  nome varchar(100) not null,
  gtin varchar(14) null,
  codigo_interno varchar(50) null,
  valor_compra decimal(18,6) not null,
  valor_venda decimal(18,6) not null,
  quantidade_estoque decimal(16,8) not null,
  cadastro date not null,
  descricao varchar(200) null
);

create table if not exists produto_categoria(
  id uuid primary key default gen_random_uuid() not null,
  nome varchar(100) not null,
  descricao varchar(100) null
);

create table if not exists produto_sub_categoria(
  id uuid primary key default gen_random_uuid() not null,
  produto_categoria_id references produto_categoria(id),
  nome varchar(100) not null,
  descricao varchar(200) null
);

create table if not exists produto_unidade_medida(
  id uuid primary key default gen_random_uuid() not null,
  sigla varchar(10) not null,
  pode_fracionar char(1) not null,
  descricao varchar(100)
);

create table if not exists produto_marca(
  id uuid primary key default gen_random_uuid() not null,
  nome varchar(50) not null,
  descricao varchar(200) null
);

-- Aqui entra o controle de estoque e a precificação dos produtos
-- ESTOQUE




create table if not exists depositos (
  id uuid primary key,
  empresa_id uuid not null,
  nome varchar(120) not null,
  ativo boolean not null default true,
  created_at timestamp not null default now()
);

create table if not exists enderecos_estoque (
  id uuid primary key,
  deposito_id uuid not null references depositos(id),
  codigo varchar(50) not null,
  descricao varchar(255),
  created_at timestamp not null default now()
);

create table if not exists lotes_produto (
  id uuid primary key,
  produto_id uuid not null references produtos(id),
  lote varchar(50) not null,
  fabricacao date,
  validade date,
  created_at timestamp not null default now()
);

create type estoque_tipo_movimento as enum ('ENTRADA_COMPRA','SAIDA_VENDA','ENTRADA_DEVOLUCAO','SAIDA_DEVOLUCAO','AJUSTE_POSITIVO','AJUSTE_NEGATIVO','TRANSFERENCIA_ENTRADA','TRANSFERENCIA_SAIDA','PRODUCAO_ENTRADA','PRODUCAO_CONSUMO','CONSUMO_INTERNO','PERDA','AVARIA','INVENTARIO');
create type estoque_origem as enum ('COMPRA','VENDA','DEVOLUCAO','INVENTARIO','TRANSFERENCIA','PRODUCAO','MANUAL');
create table if not exists movimentos_estoque (
  id uuid primary key,
  produto_id uuid not null references produtos(id),
  deposito_id uuid not null references depositos(id),
  endereco_id uuid references enderecos_estoque(id),
  lote_id uuid references lotes_produto(id),
  tipo estoque_tipo_movimento not null,
  origem estoque_origem not null,
  origem_id uuid,
  quantidade numeric(14,4) not null,
  custo_unitario numeric(14,6) not null default 0,
  valor_total numeric(14,2) generated always as (
    quantidade * custo_unitario
  ) stored,
  observacao text,
  usuario_id uuid,
  created_at timestamp not null default now()
);
create index idx_movimentos_produto on movimentos_estoque(produto_id);
create index idx_movimentos_origem on movimentos_estoque(origem, origem_id);
create index idx_movimentos_created_at on movimentos_estoque(created_at);

create table if not exists saldo_estoque (
  id uuid primary key,
  produto_id uuid not null references produtos(id),
  deposito_id uuid not null references depositos(id),
  endereco_id uuid references enderecos_estoque(id),
  lote_id uuid references lotes_produto(id),
  saldo_quantidade numeric(14,4) not null default 0,
  reservado numeric(14,4) not null default 0,
  disponivel numeric(14,4) generated always as (
    saldo_quantidade - reservado
  ) stored,
  custo_medio numeric(14,6) not null default 0,
  updated_at timestamp not null default now(),
  unique (
    produto_id,
    deposito_id,
    endereco_id,
    lote_id
  )
);
create index idx_saldo_produto on saldo_estoque(produto_id);
create index idx_saldo_deposito on saldo_estoque(deposito_id);

create type status_reservas_estoque as enum('RESERVADO','SEPARADO','FATURADO','CANCELADO');
create table if not exists reservas_estoque (
  id uuid primary key,
  produto_id uuid not null references produtos(id),
  deposito_id uuid not null references depositos(id),
  origem varchar(50) not null,
  origem_id uuid not null,
  quantidade numeric(14,4) not null,
  status status_reservas_estoque not null,
  created_at timestamp not null default now()
);

create type status_transferencias_estoque as enum('CRIADA','SEPARADA','EM_TRANSITO','RECEBIDA');
create table if not exists transferencias_estoque (
  id uuid primary key,
  deposito_origem_id uuid not null references depositos(id),
  deposito_destino_id uuid not null references depositos(id),
  status status_transferencias_estoque not null,
  observacao text,
  created_at timestamp not null default now()
);

create table if not exists transferencia_itens (
  id uuid primary key,
  transferencia_id uuid not null references transferencias_estoque(id),
  produto_id uuid not null references produtos(id),
  quantidade numeric(14,4) not null
);

create table if not exists inventarios (
  id uuid primary key,
  deposito_id uuid not null references depositos(id),
  status varchar(30) not null,
  iniciado_em timestamp,
  finalizado_em timestamp,
  created_at timestamp not null default now()
);

create table if not exists inventario_itens (
  id uuid primary key,
  inventario_id uuid not null references inventarios(id),
  produto_id uuid not null references produtos(id),
  saldo_sistema numeric(14,4) not null,
  saldo_fisico numeric(14,4) not null,
  divergencia numeric(14,4) generated always as (
    saldo_fisico - saldo_sistema
  ) stored
);

create table if not exists camadas_custo (
  id uuid primary key,
  produto_id uuid not null references produtos(id),
  movimento_id uuid not null references movimentos_estoque(id),
  quantidade numeric(14,4) not null,
  custo_unitario numeric(14,6) not null,
  saldo_quantidade numeric(14,4) not null,
  created_at timestamp not null default now()
);

create type status_transferencias_estoque as enum('ABERTA','APROVADA','SEPARANDO','ATENDIDA','PARCIAL','CANCELADA');
create table if not exists requisicoes_almoxarifado (
  id uuid primary key,
  solicitante_id uuid not null,
  setor_id uuid not null,
  status varchar(30) not null,
  observacao text,
  created_at timestamp default now()
);

create table if not exists requisicao_itens (
  id uuid primary key,
  requisicao_id uuid not null references requisicoes_almoxarifado(id),
  produto_id uuid not null references produtos(id),
  quantidade numeric(14,4) not null,
  quantidade_atendida numeric(14,4) default 0
);

-- 1. Solicitante
-- 2. Cria Requisição
-- 3. Gestor Aprova
-- 4. Reserva Estoque
-- 5. Almoxarife Separa
-- 6. Entrega
-- 7. Baixa Estoque
-- 8. Movimentação Gerada
-- 9. Histórico/Auditoria

create table if not exists cautelas_ferramentas (
  id uuid primary key,
  funcionario_id uuid not null,
  produto_id uuid not null,
  quantidade numeric(14,4),
  retirado_em timestamp,
  devolvido_em timestamp
);

-- VENDAS
-- FIM - VENDAS

create table if not exists banco(
  id uuid primary key default gen_random_uuid() not null,
  codigo varchar(10) not null,
  nome varchar(100) not null,
  url_site varchar(100)
);

create table if not exists banco_agencia(
  id uuid primary key default gen_random_uuid() not null,
  banco_id uuid references banco(id),
  numero varchar(20) not null,
  digito char(1) not null,
  nome varchar(100) not null,
  contato varchar(20) null,
  gerente varchar(50) null,
  observacao varchar(200) null
);

create table if not exists banco_conta(
  id uuid primary key default gen_random_uuid() not null,
  banco_agencia_id uuid references banco_agencia(id),
  numero varchar(20) not null,
  digito char(1) not null,
  nome varchar(100) not null,
  tipo char(1) not null, -- investimento, poupança, corente
  descricao varchar(200)
);

create table if not exists ncm(
  id uuid primary key default gen_random_uuid() not null,
  codigo varchar(8) not null,
  descricao varchar(100) null,
  aplicacao varchar(100) null
);

create table if not exists cfop(
  id uuid primary key default gen_random_uuid() not null,
  codigo int not null,
  descricao varchar(100) null,
  aplicacao varchar(100) null
);

create table if not exists cst_icms(
  id uuid primary key default gen_random_uuid() not null,
  codigo char(2) not null,
  descricao varchar(100) null,
  aplicacao varchar(100) null
);

create table if not exists cst_ipi(
  id uuid primary key default gen_random_uuid() not null,
  codigo char(2) not null,
  descricao varchar(100) null,
  aplicacao varchar(100) null
);

create table if not exists cst_cofins(
  id uuid primary key default gen_random_uuid() not null,
  codigo char(2) not null,
  descricao varchar(100) null,
  aplicacao varchar(100) null
);

create table if not exists cst_pis(
  id uuid primary key default gen_random_uuid() not null,
  codigo char(2) not null,
  descricao varchar(100) null,
  aplicacao varchar(100) null
);

create table if not exists csosn(
  id uuid primary key default gen_random_uuid() not null,
  codigo char(3) not null,
  descricao varchar(100) null,
  aplicacao varchar(100) null
);
```