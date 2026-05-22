-- Migration: Adicionar coluna valor_pago à tabela parcelas
-- Registra o valor já pago de cada parcela para tracking de progresso

ALTER TABLE parcelas ADD COLUMN valor_pago NUMERIC(15, 2) NOT NULL DEFAULT 0;

ALTER TABLE parcelas ADD CONSTRAINT chk_valor_pago CHECK (valor_pago <= valor);
