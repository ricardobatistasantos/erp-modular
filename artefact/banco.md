LISTA DE TABELAS

PESSOAS

```sql
CREATE TYPE tipoPessoa AS ENUM ('F', 'J'); -- J -> Jurídica f-> Física
create table if not exists pessoa(
  id uuid primary key default gen_random_uuid() not null,
  nome varchar(100) not null,
  email varchar(50) not null,
  tipo tipoPessoa, 
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

CREATE TYPE tipoContato AS ENUM ('PESSOAL', 'TRABALHO');
create table if not exists pessoa_contato(
  id uuid primary key default gen_random_uuid() not null,
  tipo_contato tipoContato not null, 
  telefone varchar(20) not null,
  pessoa_id uuid references pessoa(id) not null
);
CREATE INDEX IF NOT EXISTS idx_pessoa_contato_pessoa_id ON pessoa_contato (pessoa_id);

CREATE TYPE tipoEndereco AS ENUM ('RESIDENCIAL', 'TRABALHO');
create table if not exists pessoa_endereco(
  id uuid primary key default gen_random_uuid() not null,
  pessoa_id uuid references pessoa(id) not null,
  logradouro varchar(100) not null,
  numero varchar(10) not null,
  bairro varchar(100) not null,
  cidade varchar(100) not null,
  uf char(2) not null,
  cep varchar(8),
  tipo_endereco tipoEndereco not null -- Residencial, Trabalho, etc
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
  quantodade_estoque decimal(16,8) not null,
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

create table if not exists caixa(
  id uuid primary key default gen_random_uuid() not null
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