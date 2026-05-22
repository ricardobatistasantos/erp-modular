import * as fc from 'fast-check';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CancelInstallmentUseCase } from '../application/use-cases/cancel-installment.use-case';
import { Installment } from '../domain/entity/installment.entity';

/**
 * Feature: installment-settlements, Property 10: Cancellation of installment without settlements
 *
 * For any installment with status PENDENTE and no associated settlements,
 * canceling it SHALL set its status to CANCELADO.
 * If the installment has any associated settlements, cancellation SHALL be rejected.
 *
 * **Validates: Requirements 8.1, 8.2**
 */
describe('Property 10: Cancellation of installment without settlements', () => {
  let useCase: CancelInstallmentUseCase;
  let installmentRepository: any;
  let financialSettlementRepository: any;
  let accountPayableRepository: any;
  let accountReceivableRepository: any;
  let connection: any;
  let transaction: any;

  beforeEach(() => {
    transaction = {};

    installmentRepository = {
      findById: jest.fn(),
      findByOrigemId: jest.fn(),
      updateStatus: jest.fn(),
    };

    financialSettlementRepository = {
      existsByParcelaId: jest.fn(),
    };

    accountPayableRepository = {
      updateValorPago: jest.fn().mockResolvedValue({}),
    };

    accountReceivableRepository = {
      updateValorRecebido: jest.fn().mockResolvedValue({}),
    };

    connection = jest.fn(() => ({
      tx: jest.fn((callback) => callback(transaction)),
    }));

    useCase = new CancelInstallmentUseCase(
      installmentRepository,
      financialSettlementRepository,
      accountPayableRepository,
      accountReceivableRepository,
      connection,
    );
  });

  // Arbitrary for generating valid installment data
  const installmentArb = (overrides: Partial<Installment> = {}) =>
    fc.record({
      id: fc.uuid(),
      origem: fc.constantFrom('PAGAR' as const, 'RECEBER' as const),
      origemId: fc.uuid(),
      numeroParcela: fc.integer({ min: 1, max: 12 }),
      totalParcelas: fc.integer({ min: 1, max: 12 }),
      dataVencimento: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
      valor: fc.integer({ min: 1, max: 1000000 }).map((v) => v / 100),
      valorPago: fc.constant(0),
      status: fc.constant('PENDENTE' as const),
      createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
      updatedAt: fc.constant(undefined),
    }).map((inst) => ({ ...inst, ...overrides }));

  it(
    'should set status to CANCELADO for any PENDENTE installment without settlements',
    async () => {
      await fc.assert(
        fc.asyncProperty(installmentArb(), async (installment) => {
          // Setup: installment exists, no settlements
          installmentRepository.findById.mockResolvedValue(installment);
          financialSettlementRepository.existsByParcelaId.mockResolvedValue(false);

          const cancelledInstallment = { ...installment, status: 'CANCELADO' };
          installmentRepository.updateStatus.mockResolvedValue(cancelledInstallment);
          installmentRepository.findByOrigemId.mockResolvedValue([cancelledInstallment]);

          const result = await useCase.execute({ parcelaId: installment.id });

          // Property: status MUST be CANCELADO
          expect(result.status).toBe('CANCELADO');
          // Verify updateStatus was called with CANCELADO
          expect(installmentRepository.updateStatus).toHaveBeenCalledWith(
            installment.id,
            'CANCELADO',
            transaction,
          );
        }),
        { numRuns: 100 },
      );
    },
  );

  it(
    'should reject cancellation for any installment that has associated settlements',
    async () => {
      await fc.assert(
        fc.asyncProperty(installmentArb(), async (installment) => {
          // Setup: installment exists, HAS settlements
          installmentRepository.findById.mockResolvedValue(installment);
          financialSettlementRepository.existsByParcelaId.mockResolvedValue(true);

          // Property: cancellation MUST be rejected
          await expect(
            useCase.execute({ parcelaId: installment.id }),
          ).rejects.toThrow(HttpException);

          try {
            await useCase.execute({ parcelaId: installment.id });
          } catch (error) {
            expect(error).toBeInstanceOf(HttpException);
            expect((error as HttpException).getStatus()).toBe(HttpStatus.BAD_REQUEST);
            expect((error as HttpException).message).toContain(
              'Não é possível cancelar parcela',
            );
          }

          // Verify updateStatus was NOT called
          expect(installmentRepository.updateStatus).not.toHaveBeenCalled();
        }),
        { numRuns: 100 },
      );
    },
  );
});
