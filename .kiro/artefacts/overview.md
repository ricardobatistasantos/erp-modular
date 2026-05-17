# Artefacts Overview

Estes são os artefatos de referência do projeto. Todo desenvolvimento deve ser guiado por eles.

- `artefact/banco.md` — schema SQL completo do banco de dados
- `artefact/dto-pessoa.json` — payload de referência para cadastro de pessoas (cliente, colaborador, etc.)

---

## banco.md — Schema do Banco de Dados

Schema PostgreSQL completo. Organizado por domínio.

### Domínio: Pessoas

Toda entidade de negócio (cliente, colaborador, fornecedor, etc.) é derivada da tabela `pessoa`.

| Tabela | Descrição | Chave |
|---|---|---|
| `pessoa` | Entidade base. Flags indicam os papéis ativos. | `id UUID PK` |
| `pessoa_fisica` | Extensão para pessoa física | `pessoa_id FK → pessoa` |
| `pessoa_juridica` | Extensão para pessoa jurídica | `pessoa_id FK → pessoa` |
| `pessoa_contato` | Contatos (PESSOAL, TRABALHO) | `pessoa_id FK → pessoa` |
| `pessoa_endereco` | Endereços (RESIDENCIAL, TRABALHO) | `pessoa_id FK → pessoa` |
| `colaborador` | Vínculo empregatício | `pessoa_id FK → pessoa` |
| `cliente` | Dados comerciais do cliente | `pessoa_id FK → pessoa` |
| `fornecedor` | Fornecedor de produtos/serviços | `pessoa_id FK → pessoa` |
| `transportadora` | Prestador de transporte | `pessoa_id FK → pessoa` |
| `contador` | Contador com CRC | `pessoa_id FK → pessoa` |
| `vendedor` | Perfil de vendas do colaborador | `colaborador_id FK → colaborador` |

**Flags de papel na tabela `pessoa`:**
```sql
cliente       int default 0   -- 1 = é cliente
colaborador   int default 0   -- 1 = é colaborador
transportadora int default 0  -- 1 = é transportadora
contador      int default 0   -- 1 = é contador
```

**Índices únicos relevantes:**
- `pessoa.email` — único
- `pessoa_fisica.cpf` — único
- `pessoa_juridica.cnpj` — único
- `colaborador.matricula` — único

**ENUMs:**
```sql
tipo_pessoa         → 'F' | 'J'
tipo_contato        → 'PESSOAL' | 'TRABALHO'
tipo_pessoa_endereco → 'RESIDENCIAL' | 'TRABALHO'
```

---

### Domínio: Financeiro

| Tabela | Descrição |
|---|---|
| `plano_contas` | Plano de contas hierárquico (SINTETICA/ANALITICA) |
| `centro_custos` | Centros de custo hierárquicos |
| `categorias_financeiras` | Categorias vinculadas ao plano de contas |
| `contas_receber` | Contas a receber com status e forma de pagamento |
| `contas_pagar` | Contas a pagar com status e forma de pagamento |
| `lancamentos_financeiros` | Lançamentos gerados por qualquer movimentação |
| `parcelas` | Parcelas de contas (origem polimórfica via `origem` + `origem_id`) |
| `baixas_financeiras` | Registro de pagamento/recebimento efetivo |
| `estornos_financeiros` | Estornos de baixas com lançamento de estorno |
| `historico_contas` | Auditoria de alterações em contas a pagar/receber |
| `caixas` | ⚠️ Tabela vazia — a definir |
| `fluxo_caixa_diario` | ⚠️ Tabela vazia — a definir |
| `bancos` | ⚠️ Tabela vazia — a definir |
| `contas_bancarias` | ⚠️ Tabela vazia — a definir |
| `conciliacoes_bancarias` | ⚠️ Tabela vazia — a definir |
| `banco` | Cadastro de bancos |
| `banco_agencia` | Agências bancárias |
| `banco_conta` | Contas bancárias da empresa |

**ENUMs financeiros:**
```sql
tipo_plano_contas       → 'SINTETICA' | 'ANALITICA'
tipo_natureza           → 'RECEITA' | 'DESPESA' | 'ATIVO' | 'PASSIVO' | 'PATRIMONIO'
tipo_baixas_financeiras → 'RECEBER' | 'PAGAR'
tipo_historico_contas   → 'RECEBER' | 'PAGAR'
```

---

### Domínio: Produtos

| Tabela | Descrição |
|---|---|
| `produto_categoria` | Categoria de produto |
| `produto_sub_categoria` | Subcategoria vinculada à categoria |
| `produto_unidade_medida` | Unidade de medida (sigla, pode_fracionar) |
| `produto_marca` | Marca do produto |
| `produto` | Produto com preço de compra/venda, estoque, GTIN, código interno |

---

### Domínio: Estoque

| Tabela | Descrição |
|---|---|
| `depositos` | Locais físicos de armazenamento |
| `enderecos_estoque` | Posições dentro de um depósito |
| `lotes_produto` | Lotes com fabricação e validade |
| `movimentos_estoque` | Toda entrada/saída de produto (valor_total é coluna gerada) |
| `saldo_estoque` | Saldo atual por produto/depósito/lote (disponivel é coluna gerada) |
| `reservas_estoque` | Reservas para pedidos não faturados |
| `transferencias_estoque` | Transferências entre depósitos |
| `transferencia_itens` | Itens de uma transferência |
| `inventarios` | Contagens físicas por depósito |
| `inventario_itens` | Itens do inventário (divergencia é coluna gerada) |
| `camadas_custo` | Camadas de custo para cálculo de custo médio |
| `requisicoes_almoxarifado` | Requisições internas de material |
| `requisicao_itens` | Itens de uma requisição |
| `cautelas_ferramentas` | Empréstimo de ferramentas a funcionários |

**ENUMs de estoque:**
```sql
estoque_tipo_movimento → ENTRADA_COMPRA | SAIDA_VENDA | ENTRADA_DEVOLUCAO | SAIDA_DEVOLUCAO |
                         AJUSTE_POSITIVO | AJUSTE_NEGATIVO | TRANSFERENCIA_ENTRADA |
                         TRANSFERENCIA_SAIDA | PRODUCAO_ENTRADA | PRODUCAO_CONSUMO |
                         CONSUMO_INTERNO | PERDA | AVARIA | INVENTARIO

estoque_origem         → COMPRA | VENDA | DEVOLUCAO | INVENTARIO | TRANSFERENCIA | PRODUCAO | MANUAL

status_reservas_estoque → RESERVADO | SEPARADO | FATURADO | CANCELADO

status_transferencias_estoque → CRIADA | SEPARADA | EM_TRANSITO | RECEBIDA
                              → ABERTA | APROVADA | SEPARANDO | ATENDIDA | PARCIAL | CANCELADA
```

---

### Domínio: Fiscal (Tax Management)

| Tabela | Descrição |
|---|---|
| `ncm` | Nomenclatura Comum do Mercosul |
| `cfop` | Código Fiscal de Operações e Prestações |
| `cst_icms` | Código de Situação Tributária — ICMS |
| `cst_ipi` | Código de Situação Tributária — IPI |
| `cst_cofins` | Código de Situação Tributária — COFINS |
| `cst_pis` | Código de Situação Tributária — PIS |
| `csosn` | Código de Situação da Operação no Simples Nacional |

---

## dto-pessoa.json — Payload de Cadastro de Pessoa

Este é o contrato de request para cadastro de qualquer tipo de pessoa no sistema. Um único payload cobre todos os papéis simultaneamente.

```json
{
  "pessoa": {
    "nome": "string",
    "email": "string",
    "tipo": "F" | "J",
    "fisica": { "cpf": "string" },          // se tipo = 'F'
    "juridica": { "cnpj": "string" },        // se tipo = 'J'
    "contatos": [
      { "tipo": "PESSOAL" | "TRABALHO", "telefone": "string" }
    ],
    "enderecos": [
      {
        "logradouro": "string",
        "numero": number,
        "bairro": "string",
        "cidade": "string",
        "uf": "string (2 chars)",
        "cep": "string",
        "tipoEndereco": "RESIDENCIAL" | "TRABALHO"
      }
    ],
    "cadastro": "date",
    "observacao": "string?"
  },

  "colaborador": {                           // presente se for funcionário
    "matricula": "string",
    "cargo": { "id": "uuid", "nome": "string", "salario": number },
    "departamento": { "id": "uuid", "nome": "string" },
    "vendedor": {                            // opcional — se for vendedor
      "comissao": number,                    // ex: 0.05 = 5%
      "metaVendas": number
    }
  },

  "cliente": {                               // presente se for cliente
    "taxaDesconto": number,                  // ex: 0.1 = 10%
    "limiteCredito": number
  },

  "createUser": boolean                      // dispara criação de login
}
```

### Regras do Payload

| Campo | Obrigatoriedade | Observação |
|---|---|---|
| `pessoa` | Obrigatório | Sempre presente |
| `pessoa.tipo` | Obrigatório | `'F'` ou `'J'` |
| `pessoa.fisica` | Condicional | Obrigatório se `tipo = 'F'` |
| `pessoa.juridica` | Condicional | Obrigatório se `tipo = 'J'` |
| `pessoa.contatos` | Opcional | Array, pode ser vazio |
| `pessoa.enderecos` | Opcional | Array, pode ser vazio |
| `colaborador` | Opcional | Presente quando cadastrando funcionário |
| `colaborador.vendedor` | Opcional | Presente quando o funcionário é vendedor |
| `cliente` | Opcional | Presente quando cadastrando cliente |
| `createUser` | Opcional | `true` dispara evento de criação de login via fila |

### Mapeamento Payload → Tabelas

```
pessoa          → INSERT INTO pessoa
pessoa.fisica   → INSERT INTO pessoa_fisica
pessoa.juridica → INSERT INTO pessoa_juridica
pessoa.contatos → INSERT INTO pessoa_contato (N registros)
pessoa.enderecos→ INSERT INTO pessoa_endereco (N registros)
colaborador     → INSERT INTO colaborador
colaborador.vendedor → INSERT INTO vendedor
cliente         → INSERT INTO cliente
createUser=true → publish event → fila → cria login
```

### Observações

- O mesmo payload pode criar um colaborador que também é cliente (ambos os blocos presentes)
- `cargo` e `departamento` no bloco `colaborador` ainda não possuem tabelas próprias no schema — são dados que precisam de tabelas `cargos` e `departamentos` a serem criadas
- Toda a operação é executada dentro de uma única transação pg-promise
