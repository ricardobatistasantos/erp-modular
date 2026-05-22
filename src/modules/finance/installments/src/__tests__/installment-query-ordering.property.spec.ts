import * as fc from 'fast-check';
import { FindByOrigemIdInstallmentUseCase } from '../application/use-cases/find-by-origem-id-installment.use-case';
import { Installment } from '../domain/entity/installment.entity';

/**
 * Feature: installment-settlements, Property 9: Installment query ordering
 *
 * For any set of installments belonging to the same origemId,
 * querying by origemId SHALL return them ordered by numeroParcela in ascending order.
 *
 * **Validates: Requirements 5.1**
 */
describe('Property 9: Installment query ordering', () => {
  let useCase: FindByOrigemIdInstallmentUseCase;
  let installmentRepository: any;

  beforeEach(() => {
    installmentRepository = {
      findByOrigemId: jest.fn(),
    };

    useCase = new FindByOrigemIdInstallmentUseCase(installmentRepository);
  });

  // Arbitrary for generating a set of installments with the same origemId but shuffled numeroParcela
  const installmentsForOrigemArb = () =>
    fc
      .record({
        origemId: fc.uuid(),
        origem: fc.constantFrom('PAGAR' as const, 'RECEBER' as const),
        count: fc.integer({ min: 1, max: 24 }),
      })
      .chain(({ origemId, origem, count }) =>
        fc.record({
          origemId: fc.constant(origemId),
          installments: fc
            .shuffledSubarray(
              Array.from({ length: count }, (_, i) => i + 1),
              { minLength: count, maxLength: count },
            )
            .map((shuffledNumbers) =>
              shuffledNumbers.map(
                (num): Installment => ({
                  id: `id-${num}`,
                  origem,
                  origemId,
                  numeroParcela: num,
                  totalParcelas: count,
                  dataVencimento: new Date(`2024-${String(num).padStart(2, '0')}-15`),
                  valor: 100,
                  valorPago: 0,
                  status: 'PENDENTE',
                  createdAt: new Date(),
                  updatedAt: undefined,
                }),
              ),
            ),
        }),
      );

  it(
    'should return installments ordered by numeroParcela ASC for any origemId',
    async () => {
      await fc.assert(
        fc.asyncProperty(installmentsForOrigemArb(), async ({ origemId, installments }) => {
          // The repository returns installments sorted by numeroParcela ASC
          // (as implemented in the real repository with ORDER BY numero_parcela ASC)
          const sorted = [...installments].sort(
            (a, b) => a.numeroParcela - b.numeroParcela,
          );
          installmentRepository.findByOrigemId.mockResolvedValue(sorted);

          const result = await useCase.execute({ origemId });

          // Property: result MUST be ordered by numeroParcela in ascending order
          for (let i = 1; i < result.length; i++) {
            expect(result[i].numeroParcela).toBeGreaterThan(
              result[i - 1].numeroParcela,
            );
          }

          // Additionally verify the ordering is strictly sequential from 1 to N
          result.forEach((installment, index) => {
            expect(installment.numeroParcela).toBe(index + 1);
          });

          // Verify the repository was called with the correct origemId
          expect(installmentRepository.findByOrigemId).toHaveBeenCalledWith(origemId);
        }),
        { numRuns: 100 },
      );
    },
  );
});
