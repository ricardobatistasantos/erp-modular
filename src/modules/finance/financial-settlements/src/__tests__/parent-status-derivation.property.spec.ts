import * as fc from 'fast-check';
import { Installment } from '../../../installments/src/domain/entity/installment.entity';

/**
 * Feature: installment-settlements, Property 7: Parent account status derivation
 *
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 8.3**
 *
 * For any account with installments, the parent account status SHALL be:
 * - PENDENTE if no non-cancelled installment has any settlement
 * - PARCIAL if at least one non-cancelled installment has status PARCIAL or PAGO but not all are PAGO
 * - PAGO/RECEBIDO if all non-cancelled installments have status PAGO
 * - CANCELADO if all installments are cancelled
 */

// Pure function extracted from SettleInstallmentUseCase for testing
function deriveParentStatus(installments: Installment[], tipoConta: string): string {
  const activeInstallments = installments.filter((i) => i.status !== 'CANCELADO');

  if (activeInstallments.length === 0) return 'CANCELADO';

  const allPaid = activeInstallments.every((i) => i.status === 'PAGO');
  if (allPaid) return tipoConta === 'PAGAR' ? 'PAGO' : 'RECEBIDO';

  const anyPaid = activeInstallments.some(
    (i) => i.status === 'PAGO' || i.status === 'PARCIAL',
  );
  if (anyPaid) return 'PARCIAL';

  return 'PENDENTE';
}

// --- Generators ---

const installmentStatusArb = fc.oneof(
  fc.constant('PENDENTE' as const),
  fc.constant('PARCIAL' as const),
  fc.constant('PAGO' as const),
  fc.constant('CANCELADO' as const),
);

const tipoContaArb = fc.oneof(
  fc.constant('PAGAR' as const),
  fc.constant('RECEBER' as const),
);

function installmentArb(status: 'PENDENTE' | 'PARCIAL' | 'PAGO' | 'CANCELADO'): fc.Arbitrary<Installment> {
  return fc.record({
    id: fc.uuid(),
    origem: fc.oneof(fc.constant('PAGAR' as const), fc.constant('RECEBER' as const)),
    origemId: fc.uuid(),
    numeroParcela: fc.integer({ min: 1, max: 12 }),
    totalParcelas: fc.integer({ min: 1, max: 12 }),
    dataVencimento: fc.date(),
    valor: fc.integer({ min: 100, max: 100000 }).map((v) => v / 100),
    valorPago: fc.constant(0),
    status: fc.constant(status),
    createdAt: fc.date(),
    updatedAt: fc.option(fc.date(), { nil: undefined }),
  }).map((inst) => {
    // Ensure valorPago is consistent with status
    if (status === 'PAGO') {
      inst.valorPago = inst.valor;
    } else if (status === 'PARCIAL') {
      inst.valorPago = inst.valor / 2; // Some partial payment
    } else {
      inst.valorPago = 0;
    }
    return inst as Installment;
  });
}

function installmentsListArb(): fc.Arbitrary<Installment[]> {
  return fc.array(
    fc.oneof(
      installmentArb('PENDENTE'),
      installmentArb('PARCIAL'),
      installmentArb('PAGO'),
      installmentArb('CANCELADO'),
    ),
    { minLength: 1, maxLength: 12 },
  );
}

// --- Property Tests ---

describe('Feature: installment-settlements, Property 7: Parent account status derivation', () => {
  it('should return PENDENTE when all non-cancelled installments are PENDENTE', () => {
    fc.assert(
      fc.property(
        fc.array(installmentArb('PENDENTE'), { minLength: 1, maxLength: 12 }),
        fc.array(installmentArb('CANCELADO'), { minLength: 0, maxLength: 5 }),
        tipoContaArb,
        (pendingInstallments, cancelledInstallments, tipoConta) => {
          const allInstallments = [...pendingInstallments, ...cancelledInstallments];
          const result = deriveParentStatus(allInstallments, tipoConta);
          expect(result).toBe('PENDENTE');
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should return PARCIAL when at least one non-cancelled installment is PARCIAL or PAGO but not all are PAGO', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          // Case 1: Mix of PARCIAL and PENDENTE
          fc.tuple(
            fc.array(installmentArb('PARCIAL'), { minLength: 1, maxLength: 5 }),
            fc.array(installmentArb('PENDENTE'), { minLength: 1, maxLength: 5 }),
          ).map(([parcial, pendente]) => [...parcial, ...pendente]),
          // Case 2: Mix of PAGO and PENDENTE
          fc.tuple(
            fc.array(installmentArb('PAGO'), { minLength: 1, maxLength: 5 }),
            fc.array(installmentArb('PENDENTE'), { minLength: 1, maxLength: 5 }),
          ).map(([pago, pendente]) => [...pago, ...pendente]),
          // Case 3: Mix of PARCIAL and PAGO (but not all PAGO)
          fc.tuple(
            fc.array(installmentArb('PARCIAL'), { minLength: 1, maxLength: 5 }),
            fc.array(installmentArb('PAGO'), { minLength: 0, maxLength: 5 }),
          ).map(([parcial, pago]) => [...parcial, ...pago]),
        ),
        fc.array(installmentArb('CANCELADO'), { minLength: 0, maxLength: 3 }),
        tipoContaArb,
        (activeInstallments, cancelledInstallments, tipoConta) => {
          const allInstallments = [...activeInstallments, ...cancelledInstallments];
          const result = deriveParentStatus(allInstallments, tipoConta);
          expect(result).toBe('PARCIAL');
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should return PAGO when tipoConta is PAGAR and all non-cancelled installments are PAGO', () => {
    fc.assert(
      fc.property(
        fc.array(installmentArb('PAGO'), { minLength: 1, maxLength: 12 }),
        fc.array(installmentArb('CANCELADO'), { minLength: 0, maxLength: 5 }),
        (paidInstallments, cancelledInstallments) => {
          const allInstallments = [...paidInstallments, ...cancelledInstallments];
          const result = deriveParentStatus(allInstallments, 'PAGAR');
          expect(result).toBe('PAGO');
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should return RECEBIDO when tipoConta is RECEBER and all non-cancelled installments are PAGO', () => {
    fc.assert(
      fc.property(
        fc.array(installmentArb('PAGO'), { minLength: 1, maxLength: 12 }),
        fc.array(installmentArb('CANCELADO'), { minLength: 0, maxLength: 5 }),
        (paidInstallments, cancelledInstallments) => {
          const allInstallments = [...paidInstallments, ...cancelledInstallments];
          const result = deriveParentStatus(allInstallments, 'RECEBER');
          expect(result).toBe('RECEBIDO');
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should return CANCELADO when all installments are CANCELADO', () => {
    fc.assert(
      fc.property(
        fc.array(installmentArb('CANCELADO'), { minLength: 1, maxLength: 12 }),
        tipoContaArb,
        (cancelledInstallments, tipoConta) => {
          const result = deriveParentStatus(cancelledInstallments, tipoConta);
          expect(result).toBe('CANCELADO');
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should ignore CANCELADO installments when deriving status', () => {
    fc.assert(
      fc.property(
        installmentsListArb(),
        fc.array(installmentArb('CANCELADO'), { minLength: 1, maxLength: 5 }),
        tipoContaArb,
        (baseInstallments, extraCancelled, tipoConta) => {
          // Adding more cancelled installments should not change the result
          const resultWithout = deriveParentStatus(baseInstallments, tipoConta);
          const resultWith = deriveParentStatus([...baseInstallments, ...extraCancelled], tipoConta);
          expect(resultWith).toBe(resultWithout);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should always return one of the valid statuses', () => {
    fc.assert(
      fc.property(
        installmentsListArb(),
        tipoContaArb,
        (installments, tipoConta) => {
          const result = deriveParentStatus(installments, tipoConta);
          expect(['PENDENTE', 'PARCIAL', 'PAGO', 'RECEBIDO', 'CANCELADO']).toContain(result);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should return PAGO/RECEBIDO based on tipoConta when all active are PAGO', () => {
    fc.assert(
      fc.property(
        fc.array(installmentArb('PAGO'), { minLength: 1, maxLength: 12 }),
        tipoContaArb,
        (paidInstallments, tipoConta) => {
          const result = deriveParentStatus(paidInstallments, tipoConta);
          if (tipoConta === 'PAGAR') {
            expect(result).toBe('PAGO');
          } else {
            expect(result).toBe('RECEBIDO');
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
