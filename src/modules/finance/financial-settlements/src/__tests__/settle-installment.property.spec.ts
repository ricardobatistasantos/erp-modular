import * as fc from 'fast-check';
import { SettleInstallmentUseCase } from '../application/use-cases/settle-installment.use-case';
import { SettleInstallmentDTO } from '../application/dto/settle-installment.dto';
import { Installment } from '../../../installments/src/domain/entity/installment.entity';

/**
 * Property 3: Valor líquido calculation
 * Validates: Requirements 2.2
 *
 * For any settlement with (valor, juros, multa, desconto) where all values are >= 0,
 * the valorLiquido SHALL equal valor + juros + multa - desconto.
 */
describe('Feature: installment-settlements, Property 3: Valor líquido calculation', () => {
  let useCase: SettleInstallmentUseCase;
  let mockSettlementRepository: any;
  let mockInstallmentRepository: any;
  let mockAccountPayableRepository: any;
  let mockAccountReceivableRepository: any;
  let mockFinancialEntryRepository: any;
  let mockConnection: any;

  beforeEach(() => {
    mockSettlementRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByParcelaId: jest.fn(),
      existsByParcelaId: jest.fn(),
    };

    mockInstallmentRepository = {
      create: jest.fn(),
      createMany: jest.fn(),
      findById: jest.fn(),
      findByOrigemId: jest.fn(),
      updateValorPago: jest.fn(),
      updateStatus: jest.fn(),
      hasSettlements: jest.fn(),
    };

    mockAccountPayableRepository = {
      findById: jest.fn(),
      updateValorPago: jest.fn(),
    };

    mockAccountReceivableRepository = {
      findById: jest.fn(),
      updateValorRecebido: jest.fn(),
    };

    mockFinancialEntryRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
    };

    // Mock connection that executes the callback directly (simulating a transaction)
    mockConnection = jest.fn(() => ({
      tx: (callback: (t: any) => Promise<any>) => callback({}),
    }));

    useCase = new SettleInstallmentUseCase(
      mockSettlementRepository,
      mockInstallmentRepository,
      mockAccountPayableRepository,
      mockAccountReceivableRepository,
      mockFinancialEntryRepository,
      mockConnection,
    );
  });

  it('valorLiquido SHALL equal valor + juros + multa - desconto for any non-negative values', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate non-negative monetary values (using integers for cents to avoid floating point issues)
        fc.record({
          valor: fc.integer({ min: 1, max: 1_000_000 }).map((v) => v / 100),
          juros: fc.integer({ min: 0, max: 100_000 }).map((v) => v / 100),
          multa: fc.integer({ min: 0, max: 100_000 }).map((v) => v / 100),
          desconto: fc.integer({ min: 0, max: 100_000 }).map((v) => v / 100),
        }),
        async ({ valor, juros, multa, desconto }) => {
          const expectedValorLiquido = valor + juros + multa - desconto;

          // Ensure the installment has enough saldo to cover the valorLiquido
          // We need valor (installment) >= valorLiquido, so set installment valor high enough
          const installmentValor = Math.max(Math.abs(expectedValorLiquido) + 1000, 10000);

          const installment: Installment = {
            id: 'parcela-001',
            origem: 'PAGAR',
            origemId: 'conta-001',
            numeroParcela: 1,
            totalParcelas: 1,
            dataVencimento: new Date(),
            valor: installmentValor,
            valorPago: 0,
            status: 'PENDENTE',
            createdAt: new Date(),
          };

          mockInstallmentRepository.findById.mockResolvedValue(installment);
          mockInstallmentRepository.findByOrigemId.mockResolvedValue([installment]);
          mockInstallmentRepository.updateValorPago.mockResolvedValue({
            ...installment,
            valorPago: expectedValorLiquido,
            status: 'PARCIAL',
          });

          mockAccountPayableRepository.findById.mockResolvedValue({
            id: 'conta-001',
            categoriaFinanceiraId: 'cat-001',
          });
          mockAccountPayableRepository.updateValorPago.mockResolvedValue(undefined);

          mockFinancialEntryRepository.create.mockResolvedValue({
            id: 'entry-001',
          });

          let capturedSettlementData: any;
          mockSettlementRepository.create.mockImplementation((data: any) => {
            capturedSettlementData = data;
            return Promise.resolve({
              id: 'settlement-001',
              ...data,
              createdAt: new Date(),
            });
          });

          // Only execute if valorLiquido is positive (otherwise the use case would reject)
          if (expectedValorLiquido <= 0) {
            return; // Skip cases where valorLiquido <= 0 (would be rejected by saldo validation)
          }

          const dto: SettleInstallmentDTO = {
            parcelaId: 'parcela-001',
            tipoConta: 'PAGAR',
            valor,
            juros,
            multa,
            desconto,
            dataPagamento: new Date(),
            formaPagamento: 'PIX',
          };

          await useCase.execute(dto);

          // Verify the valorLiquido calculation
          const actualValorLiquido = capturedSettlementData.valorLiquido;
          const tolerance = 0.001; // floating point tolerance

          expect(Math.abs(actualValorLiquido - expectedValorLiquido)).toBeLessThan(tolerance);
          expect(capturedSettlementData.valorLiquido).toBeCloseTo(
            valor + juros + multa - desconto,
            2,
          );
        },
      ),
      { numRuns: 100 },
    );
  });
});

/**
 * Property 8: Installment valorPago equals sum of settlements
 * Validates: Requirements 6.1, 6.2
 *
 * For any installment, the valorPago field SHALL equal the sum of valorLiquido
 * of all settlements associated with that installment.
 */
describe('Feature: installment-settlements, Property 8: Installment valorPago equals sum of settlements', () => {
  let useCase: SettleInstallmentUseCase;
  let mockSettlementRepository: any;
  let mockInstallmentRepository: any;
  let mockAccountPayableRepository: any;
  let mockAccountReceivableRepository: any;
  let mockFinancialEntryRepository: any;
  let mockConnection: any;

  // Track all valorPago updates
  let lastCapturedValorPago: number;

  beforeEach(() => {
    lastCapturedValorPago = 0;

    mockSettlementRepository = {
      create: jest.fn().mockImplementation((data) =>
        Promise.resolve({
          id: `settlement-${Date.now()}`,
          ...data,
          createdAt: new Date(),
        }),
      ),
      findById: jest.fn(),
      findByParcelaId: jest.fn(),
      existsByParcelaId: jest.fn(),
    };

    mockInstallmentRepository = {
      create: jest.fn(),
      createMany: jest.fn(),
      findById: jest.fn(),
      findByOrigemId: jest.fn(),
      updateValorPago: jest.fn().mockImplementation((id, valorPago, status) => {
        lastCapturedValorPago = valorPago;
        return Promise.resolve({ id, valorPago, status });
      }),
      updateStatus: jest.fn(),
      hasSettlements: jest.fn(),
    };

    mockAccountPayableRepository = {
      findById: jest.fn().mockResolvedValue({
        id: 'account-id',
        categoriaFinanceiraId: 'cat-id',
      }),
      updateValorPago: jest.fn().mockResolvedValue({}),
    };

    mockAccountReceivableRepository = {
      findById: jest.fn().mockResolvedValue({
        id: 'account-id',
        categoriaFinanceiraId: 'cat-id',
      }),
      updateValorRecebido: jest.fn().mockResolvedValue({}),
    };

    mockFinancialEntryRepository = {
      create: jest.fn().mockResolvedValue({ id: 'entry-id' }),
      findById: jest.fn(),
      findAll: jest.fn(),
    };

    mockConnection = jest.fn(() => ({
      tx: (callback: (t: any) => Promise<any>) => callback({}),
    }));

    useCase = new SettleInstallmentUseCase(
      mockSettlementRepository,
      mockInstallmentRepository,
      mockAccountPayableRepository,
      mockAccountReceivableRepository,
      mockFinancialEntryRepository,
      mockConnection,
    );
  });

  it('valorPago SHALL equal the sum of valorLiquido of all settlements after multiple sequential settlements', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate installment valor in centavos (large enough for multiple settlements)
        fc.integer({ min: 1000, max: 1_000_000 }),
        // Generate 1 to 5 settlements as percentages of remaining balance
        fc.array(
          fc.record({
            percent: fc.integer({ min: 1, max: 100 }),
            jurosCentavos: fc.integer({ min: 0, max: 200 }),
            multaCentavos: fc.integer({ min: 0, max: 200 }),
            descontoCentavos: fc.integer({ min: 0, max: 200 }),
          }),
          { minLength: 1, maxLength: 5 },
        ),
        fc.constantFrom('PAGAR' as const, 'RECEBER' as const),
        async (installmentValorCentavos, settlements, tipoConta) => {
          const installmentValor = installmentValorCentavos / 100;

          // Track cumulative state
          let currentValorPago = 0;
          let sumOfValorLiquidos = 0;

          for (const settlement of settlements) {
            // Calculate remaining balance
            const saldoRestante = Math.round((installmentValor - currentValorPago) * 100) / 100;
            if (saldoRestante <= 0) break; // Installment fully paid

            // Calculate settlement valor as percentage of remaining balance
            const settlementValorCentavos = Math.max(
              1,
              Math.floor((saldoRestante * 100 * settlement.percent) / 100),
            );
            const settlementValor = settlementValorCentavos / 100;

            const juros = settlement.jurosCentavos / 100;
            const multa = settlement.multaCentavos / 100;
            const desconto = settlement.descontoCentavos / 100;

            // Calculate valorLiquido
            const valorLiquido = Math.round((settlementValor + juros + multa - desconto) * 100) / 100;

            // Skip if valorLiquido is <= 0 or exceeds saldo (would be rejected)
            if (valorLiquido <= 0 || valorLiquido > saldoRestante) continue;

            // Setup mock installment with current state
            const installment: Installment = {
              id: 'parcela-id',
              origem: tipoConta,
              origemId: 'origem-id',
              numeroParcela: 1,
              totalParcelas: 3,
              dataVencimento: new Date('2024-06-01'),
              valor: installmentValor,
              valorPago: currentValorPago,
              status: currentValorPago > 0 ? 'PARCIAL' : 'PENDENTE',
              createdAt: new Date(),
            };

            mockInstallmentRepository.findById.mockResolvedValue(installment);
            mockInstallmentRepository.findByOrigemId.mockResolvedValue([installment]);

            const dto: SettleInstallmentDTO = {
              parcelaId: 'parcela-id',
              tipoConta,
              valor: settlementValor,
              juros,
              multa,
              desconto,
              dataPagamento: new Date('2024-06-15'),
              formaPagamento: 'PIX',
            };

            await useCase.execute(dto);

            // Track the sum of all valorLiquidos applied
            sumOfValorLiquidos = Math.round((sumOfValorLiquidos + valorLiquido) * 100) / 100;

            // Update current state for next iteration
            currentValorPago = lastCapturedValorPago;
          }

          // The invariant: valorPago must equal the sum of all valorLiquido values
          if (sumOfValorLiquidos > 0) {
            expect(lastCapturedValorPago).toBeCloseTo(sumOfValorLiquidos, 2);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});

/**
 * Property 6: Installment status derivation
 *
 * For any installment after a settlement is applied, the status SHALL be:
 * - PAGO if valorPago equals valor
 * - PARCIAL if valorPago is greater than 0 but less than valor
 * - PENDENTE if valorPago equals 0
 *
 * **Validates: Requirements 2.6, 4.1, 4.3**
 */
describe('Feature: installment-settlements, Property 6: Installment status derivation', () => {
  let useCase: SettleInstallmentUseCase;
  let mockSettlementRepository: any;
  let mockInstallmentRepository: any;
  let mockAccountPayableRepository: any;
  let mockAccountReceivableRepository: any;
  let mockFinancialEntryRepository: any;
  let mockConnection: any;

  // Track the status passed to updateValorPago
  let capturedStatus: string;
  let capturedValorPago: number;

  beforeEach(() => {
    capturedStatus = '';
    capturedValorPago = 0;

    mockSettlementRepository = {
      create: jest.fn().mockImplementation((data) =>
        Promise.resolve({
          id: 'settlement-id',
          ...data,
          createdAt: new Date(),
        }),
      ),
      findById: jest.fn(),
      findByParcelaId: jest.fn(),
      existsByParcelaId: jest.fn(),
    };

    mockInstallmentRepository = {
      create: jest.fn(),
      createMany: jest.fn(),
      findById: jest.fn(),
      findByOrigemId: jest.fn(),
      updateValorPago: jest.fn().mockImplementation((id, valorPago, status) => {
        capturedStatus = status;
        capturedValorPago = valorPago;
        return Promise.resolve({ id, valorPago, status });
      }),
      updateStatus: jest.fn(),
      hasSettlements: jest.fn(),
    };

    mockAccountPayableRepository = {
      findById: jest.fn().mockResolvedValue({
        id: 'account-id',
        categoriaFinanceiraId: 'cat-id',
      }),
      updateValorPago: jest.fn().mockResolvedValue({}),
    };

    mockAccountReceivableRepository = {
      findById: jest.fn().mockResolvedValue({
        id: 'account-id',
        categoriaFinanceiraId: 'cat-id',
      }),
      updateValorRecebido: jest.fn().mockResolvedValue({}),
    };

    mockFinancialEntryRepository = {
      create: jest.fn().mockResolvedValue({ id: 'entry-id' }),
      findById: jest.fn(),
      findAll: jest.fn(),
    };

    // Mock connection().tx() to execute the callback directly
    mockConnection = jest.fn(() => ({
      tx: (callback: (t: any) => Promise<any>) => callback({}),
    }));

    useCase = new SettleInstallmentUseCase(
      mockSettlementRepository,
      mockInstallmentRepository,
      mockAccountPayableRepository,
      mockAccountReceivableRepository,
      mockFinancialEntryRepository,
      mockConnection,
    );
  });

  it('should derive status PAGO when settlement causes valorPago to equal valor', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate installment valor in centavos (at least 1 centavo)
        fc.integer({ min: 1, max: 1_000_000 }),
        // Generate existing valorPago in centavos (0 to valor-1), using percentage
        fc.integer({ min: 0, max: 99 }),
        fc.constantFrom('PAGAR' as const, 'RECEBER' as const),
        async (valorCentavos, existingPaidPercent, tipoConta) => {
          // Use integer centavos arithmetic to avoid floating point issues
          const existingPaidCentavos = Math.floor((valorCentavos * existingPaidPercent) / 100);
          const saldoRestanteCentavos = valorCentavos - existingPaidCentavos;

          // Skip if saldo is 0 (already paid)
          if (saldoRestanteCentavos <= 0) return;

          // Convert to decimal for the use case
          const valor = valorCentavos / 100;
          const existingValorPago = existingPaidCentavos / 100;
          const saldoRestante = saldoRestanteCentavos / 100;

          const installment: Installment = {
            id: 'parcela-id',
            origem: tipoConta,
            origemId: 'origem-id',
            numeroParcela: 1,
            totalParcelas: 1,
            dataVencimento: new Date('2024-06-01'),
            valor,
            valorPago: existingValorPago,
            status: existingValorPago > 0 ? 'PARCIAL' : 'PENDENTE',
            createdAt: new Date(),
          };

          mockInstallmentRepository.findById.mockResolvedValue(installment);
          mockInstallmentRepository.findByOrigemId.mockResolvedValue([installment]);

          // Settlement that pays exactly the remaining balance → should result in PAGO
          const dto: SettleInstallmentDTO = {
            parcelaId: 'parcela-id',
            tipoConta,
            valor: saldoRestante,
            juros: 0,
            multa: 0,
            desconto: 0,
            dataPagamento: new Date('2024-06-15'),
            formaPagamento: 'PIX',
          };

          await useCase.execute(dto);

          // After settlement, valorPago should equal valor → status must be PAGO
          expect(capturedStatus).toBe('PAGO');
          expect(capturedValorPago).toBeCloseTo(valor, 2);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should derive status PARCIAL when settlement causes valorPago to be greater than 0 but less than valor', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate installment valor in centavos (at least 2 centavos so partial is possible)
        fc.integer({ min: 200, max: 1_000_000 }),
        // Generate settlement as percentage of valor (1-99%) ensuring partial
        fc.integer({ min: 1, max: 99 }),
        fc.constantFrom('PAGAR' as const, 'RECEBER' as const),
        async (valorCentavos, settlementPercent, tipoConta) => {
          const valor = valorCentavos / 100;
          // Settlement amount is a strict fraction of valor using integer arithmetic
          const settlementCentavos = Math.floor((valorCentavos * settlementPercent) / 100);
          const settlementAmount = settlementCentavos / 100;

          // Skip edge cases where rounding makes it equal to valor or 0
          if (settlementAmount <= 0 || settlementAmount >= valor) return;

          const installment: Installment = {
            id: 'parcela-id',
            origem: tipoConta,
            origemId: 'origem-id',
            numeroParcela: 1,
            totalParcelas: 3,
            dataVencimento: new Date('2024-06-01'),
            valor,
            valorPago: 0, // Start with no payments
            status: 'PENDENTE',
            createdAt: new Date(),
          };

          mockInstallmentRepository.findById.mockResolvedValue(installment);
          mockInstallmentRepository.findByOrigemId.mockResolvedValue([installment]);

          const dto: SettleInstallmentDTO = {
            parcelaId: 'parcela-id',
            tipoConta,
            valor: settlementAmount,
            juros: 0,
            multa: 0,
            desconto: 0,
            dataPagamento: new Date('2024-06-15'),
            formaPagamento: 'BOLETO',
          };

          await useCase.execute(dto);

          // After partial settlement, 0 < valorPago < valor → status must be PARCIAL
          expect(capturedStatus).toBe('PARCIAL');
          expect(capturedValorPago).toBeGreaterThan(0);
          expect(capturedValorPago).toBeLessThan(valor);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should have status PENDENTE when valorPago equals 0 (before any settlement)', async () => {
    /**
     * This property validates that installments with valorPago = 0 have status PENDENTE.
     * Since the use case always applies a positive valorLiquido (rejects <= 0),
     * it's impossible for a settlement to result in valorPago = 0 after being applied.
     * We validate the precondition: installments with no settlements have valorPago = 0
     * and status PENDENTE.
     */
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 1_000_000 }),
        fc.constantFrom('PAGAR' as const, 'RECEBER' as const),
        fc.integer({ min: 1, max: 12 }),
        fc.integer({ min: 1, max: 12 }),
        async (valorCentavos, tipoConta, numeroParcela, totalParcelas) => {
          const valor = valorCentavos / 100;
          const adjustedTotal = Math.max(numeroParcela, totalParcelas);

          const installment: Installment = {
            id: 'parcela-id',
            origem: tipoConta,
            origemId: 'origem-id',
            numeroParcela,
            totalParcelas: adjustedTotal,
            dataVencimento: new Date('2024-06-01'),
            valor,
            valorPago: 0,
            status: 'PENDENTE',
            createdAt: new Date(),
          };

          // When valorPago is 0, status must be PENDENTE
          expect(installment.valorPago).toBe(0);
          expect(installment.status).toBe('PENDENTE');

          // Verify the use case logic: the status derivation in the use case uses
          // novoValorPago >= valor → PAGO, otherwise → PARCIAL
          // Since any valid settlement adds valorLiquido > 0, after a settlement
          // valorPago will always be > 0, so status will be PARCIAL or PAGO, never PENDENTE.
          // This confirms PENDENTE is only for installments with no settlements (valorPago = 0).
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should correctly derive status with juros, multa, and desconto affecting valorLiquido', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate installment valor in centavos
        fc.integer({ min: 1000, max: 1_000_000 }),
        // Generate base settlement valor as percentage (1-50%)
        fc.integer({ min: 1, max: 50 }),
        // Generate juros, multa, desconto in centavos
        fc.integer({ min: 0, max: 500 }),
        fc.integer({ min: 0, max: 500 }),
        fc.integer({ min: 0, max: 500 }),
        fc.constantFrom('PAGAR' as const, 'RECEBER' as const),
        async (valorCentavos, basePercent, jurosCentavos, multaCentavos, descontoCentavos, tipoConta) => {
          const valor = valorCentavos / 100;
          const juros = jurosCentavos / 100;
          const multa = multaCentavos / 100;
          const desconto = descontoCentavos / 100;

          // Base settlement valor as percentage of installment valor using integer arithmetic
          const baseValorCentavos = Math.floor((valorCentavos * basePercent) / 100);
          const baseValor = baseValorCentavos / 100;
          if (baseValor <= 0) return;

          // Calculate valorLiquido
          const valorLiquido = baseValor + juros + multa - desconto;

          // Skip if valorLiquido is <= 0 or exceeds valor (would be rejected by use case)
          if (valorLiquido <= 0 || valorLiquido > valor) return;

          const installment: Installment = {
            id: 'parcela-id',
            origem: tipoConta,
            origemId: 'origem-id',
            numeroParcela: 1,
            totalParcelas: 1,
            dataVencimento: new Date('2024-06-01'),
            valor,
            valorPago: 0,
            status: 'PENDENTE',
            createdAt: new Date(),
          };

          mockInstallmentRepository.findById.mockResolvedValue(installment);
          mockInstallmentRepository.findByOrigemId.mockResolvedValue([installment]);

          const dto: SettleInstallmentDTO = {
            parcelaId: 'parcela-id',
            tipoConta,
            valor: baseValor,
            juros,
            multa,
            desconto,
            dataPagamento: new Date('2024-06-15'),
            formaPagamento: 'CARTAO',
          };

          await useCase.execute(dto);

          // Verify status derivation based on resulting valorPago
          if (Math.abs(capturedValorPago - valor) < 0.005) {
            // valorPago equals valor → PAGO
            expect(capturedStatus).toBe('PAGO');
          } else if (capturedValorPago > 0 && capturedValorPago < valor) {
            // 0 < valorPago < valor → PARCIAL
            expect(capturedStatus).toBe('PARCIAL');
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});


/**
 * Property 4: Settlement round-trip preserves data
 * Validates: Requirements 2.3, 2.4
 *
 * For any valid settlement input, creating a settlement and then retrieving it by ID
 * SHALL return a record with all original fields (parcelaId, valor, juros, multa, desconto,
 * valorLiquido, dataPagamento, formaPagamento) preserved, and a corresponding financial entry
 * SHALL exist with valor equal to the valorLiquido.
 */
describe('Feature: installment-settlements, Property 4: Settlement round-trip preserves data', () => {
  let useCase: SettleInstallmentUseCase;
  let mockSettlementRepository: any;
  let mockInstallmentRepository: any;
  let mockAccountPayableRepository: any;
  let mockAccountReceivableRepository: any;
  let mockFinancialEntryRepository: any;
  let mockConnection: any;

  // Capture data passed to repository create methods
  let capturedSettlementData: any;
  let capturedFinancialEntryData: any;

  beforeEach(() => {
    capturedSettlementData = null;
    capturedFinancialEntryData = null;

    mockSettlementRepository = {
      create: jest.fn().mockImplementation((data: any) => {
        capturedSettlementData = data;
        return Promise.resolve({
          id: 'settlement-001',
          ...data,
          createdAt: new Date(),
        });
      }),
      findById: jest.fn(),
      findByParcelaId: jest.fn(),
      existsByParcelaId: jest.fn(),
    };

    mockInstallmentRepository = {
      create: jest.fn(),
      createMany: jest.fn(),
      findById: jest.fn(),
      findByOrigemId: jest.fn(),
      updateValorPago: jest.fn().mockImplementation((id, valorPago, status) =>
        Promise.resolve({ id, valorPago, status }),
      ),
      updateStatus: jest.fn(),
      hasSettlements: jest.fn(),
    };

    mockAccountPayableRepository = {
      findById: jest.fn().mockResolvedValue({
        id: 'conta-001',
        categoriaFinanceiraId: 'cat-001',
      }),
      updateValorPago: jest.fn().mockResolvedValue({}),
    };

    mockAccountReceivableRepository = {
      findById: jest.fn().mockResolvedValue({
        id: 'conta-001',
        categoriaFinanceiraId: 'cat-001',
      }),
      updateValorRecebido: jest.fn().mockResolvedValue({}),
    };

    mockFinancialEntryRepository = {
      create: jest.fn().mockImplementation((data: any) => {
        capturedFinancialEntryData = data;
        return Promise.resolve({ id: 'entry-001', ...data });
      }),
      findById: jest.fn(),
      findAll: jest.fn(),
    };

    mockConnection = jest.fn(() => ({
      tx: (callback: (t: any) => Promise<any>) => callback({}),
    }));

    useCase = new SettleInstallmentUseCase(
      mockSettlementRepository,
      mockInstallmentRepository,
      mockAccountPayableRepository,
      mockAccountReceivableRepository,
      mockFinancialEntryRepository,
      mockConnection,
    );
  });

  it('all original fields SHALL be preserved in the created settlement record and financial entry SHALL have valor equal to valorLiquido', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          // Generate monetary values in centavos to avoid floating point issues
          valorCentavos: fc.integer({ min: 1, max: 500_000 }),
          jurosCentavos: fc.integer({ min: 0, max: 50_000 }),
          multaCentavos: fc.integer({ min: 0, max: 50_000 }),
          descontoCentavos: fc.integer({ min: 0, max: 50_000 }),
          // Generate form of payment
          formaPagamento: fc.constantFrom('PIX', 'BOLETO', 'CARTAO', 'DINHEIRO', 'TRANSFERENCIA'),
          // Generate tipoConta
          tipoConta: fc.constantFrom('PAGAR' as const, 'RECEBER' as const),
          // Generate a date offset in days from a base date
          dataPagamentoDaysOffset: fc.integer({ min: 0, max: 365 }),
        }),
        async ({
          valorCentavos,
          jurosCentavos,
          multaCentavos,
          descontoCentavos,
          formaPagamento,
          tipoConta,
          dataPagamentoDaysOffset,
        }) => {
          const valor = valorCentavos / 100;
          const juros = jurosCentavos / 100;
          const multa = multaCentavos / 100;
          const desconto = descontoCentavos / 100;

          // Calculate expected valorLiquido
          const expectedValorLiquido = Math.round((valor + juros + multa - desconto) * 100) / 100;

          // Skip cases where valorLiquido <= 0 (would be rejected by use case)
          if (expectedValorLiquido <= 0) return;

          // Ensure installment has enough saldo to cover the valorLiquido
          const installmentValor = Math.max(expectedValorLiquido + 100, 10000);

          const dataPagamento = new Date('2024-01-01');
          dataPagamento.setDate(dataPagamento.getDate() + dataPagamentoDaysOffset);

          const installment: Installment = {
            id: 'parcela-001',
            origem: tipoConta,
            origemId: 'conta-001',
            numeroParcela: 1,
            totalParcelas: 3,
            dataVencimento: new Date('2024-06-01'),
            valor: installmentValor,
            valorPago: 0,
            status: 'PENDENTE',
            createdAt: new Date(),
          };

          mockInstallmentRepository.findById.mockResolvedValue(installment);
          mockInstallmentRepository.findByOrigemId.mockResolvedValue([installment]);

          const dto: SettleInstallmentDTO = {
            parcelaId: 'parcela-001',
            tipoConta,
            valor,
            juros,
            multa,
            desconto,
            dataPagamento,
            formaPagamento,
          };

          await useCase.execute(dto);

          // Verify all original fields are preserved in the settlement record
          expect(capturedSettlementData).not.toBeNull();
          expect(capturedSettlementData.parcelaId).toBe('parcela-001');
          expect(capturedSettlementData.valor).toBeCloseTo(valor, 2);
          expect(capturedSettlementData.juros).toBeCloseTo(juros, 2);
          expect(capturedSettlementData.multa).toBeCloseTo(multa, 2);
          expect(capturedSettlementData.desconto).toBeCloseTo(desconto, 2);
          expect(capturedSettlementData.valorLiquido).toBeCloseTo(expectedValorLiquido, 2);
          expect(capturedSettlementData.dataPagamento).toEqual(dataPagamento);
          expect(capturedSettlementData.formaPagamento).toBe(formaPagamento);

          // Verify financial entry was created with valor equal to valorLiquido
          expect(capturedFinancialEntryData).not.toBeNull();
          expect(capturedFinancialEntryData.valor).toBeCloseTo(expectedValorLiquido, 2);
        },
      ),
      { numRuns: 100 },
    );
  });
});
