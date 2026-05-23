import * as fc from 'fast-check';
import { GenerateInstallmentsUseCase } from '../application/use-cases/generate-installments.use-case';
import { Installment } from '../domain/entity/installment.entity';

/**
 * Feature: installment-settlements
 * Property 2: Installment generation produces correct structure
 *
 * Validates: Requirements 1.1, 1.2, 1.3, 1.5
 *
 * For any valid generation request with N installments, the system SHALL produce
 * exactly N installments with sequential numeroParcela from 1 to N, each with
 * totalParcelas = N, status PENDENTE, valorPago = 0, and monthly-spaced
 * dataVencimento values.
 */
describe('Feature: installment-settlements, Property 2: Installment generation produces correct structure', () => {
  let useCase: GenerateInstallmentsUseCase;
  let installmentRepository: any;
  let accountPayableRepository: any;
  let accountReceivableRepository: any;
  let connection: any;
  let transaction: any;

  beforeEach(() => {
    transaction = {};

    installmentRepository = {
      createMany: jest.fn((data: any[]) =>
        Promise.resolve(
          data.map((item, index) => ({
            id: `installment-${index + 1}`,
            origem: item.origem,
            origemId: item.origemId,
            numeroParcela: item.numeroParcela,
            totalParcelas: item.totalParcelas,
            dataVencimento: item.dataVencimento,
            valor: item.valor,
            valorPago: 0,
            status: 'PENDENTE',
            createdAt: new Date(),
          })),
        ),
      ),
      hasSettlements: jest.fn().mockResolvedValue(false),
    };

    accountPayableRepository = {
      findById: jest.fn(),
    };

    accountReceivableRepository = {
      findById: jest.fn(),
    };

    connection = jest.fn(() => ({
      tx: jest.fn((callback) => callback(transaction)),
    }));

    useCase = new GenerateInstallmentsUseCase(
      installmentRepository,
      accountPayableRepository,
      accountReceivableRepository,
      connection,
    );
  });

  /**
   * **Validates: Requirements 1.1, 1.2, 1.3, 1.5**
   */
  it('should produce exactly N installments with correct structural properties', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate valid inputs
        fc.record({
          tipoConta: fc.constantFrom('PAGAR' as const, 'RECEBER' as const),
          quantidadeParcelas: fc.integer({ min: 1, max: 60 }),
          valor: fc.integer({ min: 1, max: 10_000_000 }).map((v) => v / 100), // values from 0.01 to 100000.00
          dataVencimento: fc.date({
            min: new Date('2020-01-01'),
            max: new Date('2030-12-31'),
          }),
          intervaloMeses: fc.integer({ min: 1, max: 12 }),
        }),
        async ({ tipoConta, quantidadeParcelas, valor, dataVencimento, intervaloMeses }) => {
          // Setup mock account
          const account = {
            id: 'conta-id',
            valor,
            dataVencimento,
          };

          if (tipoConta === 'PAGAR') {
            accountPayableRepository.findById.mockResolvedValue(account);
          } else {
            accountReceivableRepository.findById.mockResolvedValue(account);
          }

          const result = await useCase.execute({
            tipoConta,
            contaId: 'conta-id',
            quantidadeParcelas,
            intervaloMeses,
          });

          // Property: Exactly N installments are produced
          expect(result).toHaveLength(quantidadeParcelas);

          // Property: Sequential numeroParcela from 1 to N
          for (let i = 0; i < result.length; i++) {
            expect(result[i].numeroParcela).toBe(i + 1);
          }

          // Property: Each installment has totalParcelas = N
          for (const installment of result) {
            expect(installment.totalParcelas).toBe(quantidadeParcelas);
          }

          // Property: Each installment has status PENDENTE
          for (const installment of result) {
            expect(installment.status).toBe('PENDENTE');
          }

          // Property: Each installment has valorPago = 0
          for (const installment of result) {
            expect(installment.valorPago).toBe(0);
          }

          // Property: Monthly-spaced dataVencimento values
          // Each installment's due date is baseDate + i * intervaloMeses months
          // We verify that each date is offset from the base by the expected number of months
          const baseDate = new Date(dataVencimento);
          for (let i = 0; i < result.length; i++) {
            const expectedDate = new Date(baseDate);
            expectedDate.setMonth(expectedDate.getMonth() + i * intervaloMeses);

            const actualDate = new Date(result[i].dataVencimento);
            expect(actualDate.getTime()).toBe(expectedDate.getTime());
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
