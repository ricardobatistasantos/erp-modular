import * as fc from 'fast-check';

/**
 * Geradores (arbitraries) reutilizáveis para testes de propriedade
 * do módulo de parcelamento.
 *
 * Feature: installment-payments
 * Suporte a todos os testes de propriedade
 */

/**
 * Gera valores monetários válidos entre R$ 0.01 e R$ 100.000,00
 * com precisão de 2 casas decimais.
 */
export const monetaryValue = () =>
  fc.integer({ min: 1, max: 10_000_000 }).map((v) => v / 100);

/**
 * Gera quantidade de parcelas entre 1 e 60.
 * Limitado a 60 para performance dos testes.
 */
export const installmentCount = () => fc.integer({ min: 1, max: 60 });

/**
 * Gera intervalo em meses entre parcelas (1 a 12 meses).
 */
export const intervalMonths = () => fc.integer({ min: 1, max: 12 });

/**
 * Gera datas base entre 2020-01-01 e 2030-12-31.
 */
export const baseDate = () =>
  fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') });

/**
 * Gera tipo de conta: 'PAGAR' ou 'RECEBER'.
 */
export const tipoConta = () =>
  fc.constantFrom('PAGAR' as const, 'RECEBER' as const);
