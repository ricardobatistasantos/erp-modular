LISTA DE TABELAS

PESSOAS

```sql
create table if not exists pessoa(
  id uuid primary key default gen_random_uuid() not null,
  nome varchar(100) not null,
  email varchar(50) not null,
  tipo char(1)  not null, -- J -> Jurídica f-> Física
  cliente char(1),
  colaborador char(1),
  trampostadora char(1),
  contador char(1),
  cadastro date not null,
  observacao varchar(255) null
);

create table if not exists pessoa_juridica(
  id uuid primary key default gen_random_uuid() not null,
  pessoa_id uuid references pessoa(id),
  cnpj varchar(14) not null,
  nome_fantasia varchar(100) null,
  escricao_estadual varchar(45) null,
  escricao_municipal varchar(45) null,
  constituicao date,
  regime char(1), -- Lucro real, lucro presumido, simples nacional
  crt char(1) -- codigo de regime tributário
);

create table if not exists pessoa_fisica(
  id uuid primary key default gen_random_uuid() not null,
  pessoa_id uuid references pessoa(id) not null,
  cpf varchar(11) not null,
  rg varchar(20) null,
  sexo char(1) not null
);

create table if not exists pessoa_contato(
  id uuid primary key default gen_random_uuid() not null,
  tipo_contato varchar(100) not null, -- Pessoal, trabalho, etc
  telefone varchar(100) not null,
  pessoa_id uuid references pessoa(id) not null
);

create table if not exists pessoa_endereco(
  id uuid primary key default gen_random_uuid() not null,
  pessoa_id uuid references pessoa(id) not null,
  logradouro varchar(100) not null,
  numero varchar(10) not null,
  bairro varchar(100) not null,
  cidade varchar(100) not null,
  uf char(2) not null,
  cep varchar(8),
  tipo_endereco varchar(100) not null -- Residencial, Trabalho, etc
);

create table if not exists cliente(
  id uuid primary key default gen_random_uuid() not null,
  pessoa_id uuid references pessoa(id) not null,
  taxa_desconto decimal(8) null,
  limit_credito decimal(8) null
);

create table if not exists colaborador(
  id uuid primary key default gen_random_uuid() not null,
  pessoa_id uuid references pessoa(id) not null,
  matricula varchar(10) not null,
  demissao date null,
  admissao date not null,
  cargo_id uuid references cargo(id) not null,
  departamento_id uuid references departamento(id) not null
);

create table if not exists departamento(
  id uuid primary key default gen_random_uuid() not null,
  empresa_id uuid references empresa(id),
  nome varchar(50) not null,
  descricao varchar(200) null
);

create table if not exists cargo(
  id uuid primary key default gen_random_uuid() not null,
  nome varchar(50) not null,
  salario decimal(18,6) not null
  descricao varchar(200) null
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