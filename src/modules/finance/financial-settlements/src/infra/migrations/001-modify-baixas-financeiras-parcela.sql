-- Migration: Modificar tabela baixas_financeiras para vincular baixas a parcelas
-- Substitui conta_id por parcela_id e adiciona campos de juros, multa, desconto e valor_liquido

-- Adicionar novas colunas
ALTER TABLE baixas_financeiras
  ADD COLUMN parcela_id UUID,
  ADD COLUMN juros NUMERIC(15, 2) NOT NULL DEFAULT 0,
  ADD COLUMN multa NUMERIC(15, 2) NOT NULL DEFAULT 0,
  ADD COLUMN desconto NUMERIC(15, 2) NOT NULL DEFAULT 0,
  ADD COLUMN valor_liquido NUMERIC(15, 2);

-- Remover coluna conta_id (substituída por parcela_id via parcela -> conta)
ALTER TABLE baixas_financeiras DROP COLUMN conta_id;

-- Tornar parcela_id e valor_liquido NOT NULL
ALTER TABLE baixas_financeiras
  ALTER COLUMN parcela_id SET NOT NULL,
  ALTER COLUMN valor_liquido SET NOT NULL;

-- Adicionar FK para parcelas
ALTER TABLE baixas_financeiras
  ADD CONSTRAINT fk_baixa_parcela FOREIGN KEY (parcela_id) REFERENCES parcelas(id);

-- Criar índice para consultas por parcela
CREATE INDEX idx_baixas_parcela_id ON baixas_financeiras(parcela_id);
