-- Migration: Create cargo and departamento tables
-- Adds FK columns to colaborador

CREATE TABLE cargo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR NOT NULL,
  salario DECIMAL NOT NULL
);

CREATE TABLE departamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR NOT NULL
);

ALTER TABLE colaborador
  ADD COLUMN cargo_id UUID REFERENCES cargo(id),
  ADD COLUMN departamento_id UUID REFERENCES departamento(id);
