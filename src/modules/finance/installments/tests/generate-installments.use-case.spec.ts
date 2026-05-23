import { HttpException, HttpStatus } from '@nestjs/common';
import { GenerateInstallmentsUseCase } from '../application/use-cases/generate-installments.use-case';

describe('GenerateInstallmentsUseCase', () => {
  let useCase: GenerateInstallmentsUseCase;
  let installmentRepository: any;
  let accountPayableRepository: any;
  let accountReceivableRepository: any;
  let connection: any;
  let transaction: any;

  beforeEach(() => {
    transaction = {};

    installmentRepository = {
      createMany: jest.fn(),
      hasSettlements: jest.fn(),
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

  describe('Error scenarios', () => {
    it('should throw 404 when conta a pagar is not found', async () => {
      accountPayableRepository.findById.mockResolvedValue(null);

      await expect(
        useCase.execute({
          tipoConta: 'PAGAR',
          contaId: 'non-existent-id',
          quantidadeParcelas: 3,
        }),
      ).rejects.toThrow(
        new HttpException('Conta a pagar não encontrada', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw 404 when conta a receber is not found', async () => {
      accountReceivableRepository.findById.mockResolvedValue(null);

      await expect(
        useCase.execute({
          tipoConta: 'RECEBER',
          contaId: 'non-existent-id',
          quantidadeParcelas: 3,
        }),
      ).rejects.toThrow(
        new HttpException(
          'Conta a receber não encontrada',
          HttpStatus.NOT_FOUND,
        ),
      );
    });



    it('should throw 400 when re-generating installments with existing settlements', async () => {
      accountPayableRepository.findById.mockResolvedValue({
        id: 'conta-1',
        valor: 300,
        dataVencimento: new Date('2024-01-15'),
      });
      installmentRepository.hasSettlements.mockResolvedValue(true);

      await expect(
        useCase.execute({
          tipoConta: 'PAGAR',
          contaId: 'conta-1',
          quantidadeParcelas: 3,
        }),
      ).rejects.toThrow(
        new HttpException(
          'Não é possível re-gerar parcelas: existem baixas financeiras vinculadas',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });
  });

  describe('Rounding edge case', () => {
    it('should distribute R$ 100.00 into 3 installments with correct rounding (last parcela absorbs remainder)', async () => {
      accountPayableRepository.findById.mockResolvedValue({
        id: 'conta-1',
        valor: 100,
        dataVencimento: new Date('2024-01-15'),
      });
      installmentRepository.hasSettlements.mockResolvedValue(false);
      installmentRepository.createMany.mockImplementation((data) => data);

      const result = await useCase.execute({
        tipoConta: 'PAGAR',
        contaId: 'conta-1',
        quantidadeParcelas: 3,
      });

      // R$ 100.00 / 3 = R$ 33.33 each, last one gets R$ 33.34
      expect(result).toHaveLength(3);
      expect(result[0].valor).toBe(33.33);
      expect(result[1].valor).toBe(33.33);
      expect(result[2].valor).toBe(33.34);

      // Sum must equal original value
      const sum = result.reduce((acc, i) => acc + i.valor, 0);
      expect(Math.round(sum * 100) / 100).toBe(100);
    });

    it('should handle exact division without rounding issues', async () => {
      accountPayableRepository.findById.mockResolvedValue({
        id: 'conta-1',
        valor: 300,
        dataVencimento: new Date('2024-01-15'),
      });
      installmentRepository.hasSettlements.mockResolvedValue(false);
      installmentRepository.createMany.mockImplementation((data) => data);

      const result = await useCase.execute({
        tipoConta: 'PAGAR',
        contaId: 'conta-1',
        quantidadeParcelas: 3,
      });

      expect(result).toHaveLength(3);
      expect(result[0].valor).toBe(100);
      expect(result[1].valor).toBe(100);
      expect(result[2].valor).toBe(100);
    });
  });

  describe('Optional fields', () => {
    it('should use intervaloMeses default of 1 when not specified', async () => {
      const baseDate = new Date('2024-01-15');
      accountPayableRepository.findById.mockResolvedValue({
        id: 'conta-1',
        valor: 300,
        dataVencimento: baseDate,
      });
      installmentRepository.hasSettlements.mockResolvedValue(false);
      installmentRepository.createMany.mockImplementation((data) => data);

      const result = await useCase.execute({
        tipoConta: 'PAGAR',
        contaId: 'conta-1',
        quantidadeParcelas: 3,
      });

      expect(result).toHaveLength(3);
      // First installment: same month as base date
      expect(result[0].dataVencimento.getMonth()).toBe(0); // January
      // Second installment: 1 month later
      expect(result[1].dataVencimento.getMonth()).toBe(1); // February
      // Third installment: 2 months later
      expect(result[2].dataVencimento.getMonth()).toBe(2); // March
    });

    it('should use custom intervaloMeses when specified', async () => {
      const baseDate = new Date('2024-01-15');
      accountPayableRepository.findById.mockResolvedValue({
        id: 'conta-1',
        valor: 600,
        dataVencimento: baseDate,
      });
      installmentRepository.hasSettlements.mockResolvedValue(false);
      installmentRepository.createMany.mockImplementation((data) => data);

      const result = await useCase.execute({
        tipoConta: 'PAGAR',
        contaId: 'conta-1',
        quantidadeParcelas: 3,
        intervaloMeses: 2,
      });

      expect(result).toHaveLength(3);
      // First installment: same month as base date
      expect(result[0].dataVencimento.getMonth()).toBe(0); // January
      // Second installment: 2 months later
      expect(result[1].dataVencimento.getMonth()).toBe(2); // March
      // Third installment: 4 months later
      expect(result[2].dataVencimento.getMonth()).toBe(4); // May
    });
  });

  describe('Successful generation', () => {
    it('should generate installments with correct structure for conta a pagar', async () => {
      accountPayableRepository.findById.mockResolvedValue({
        id: 'conta-1',
        valor: 300,
        dataVencimento: new Date('2024-03-10'),
      });
      installmentRepository.hasSettlements.mockResolvedValue(false);
      installmentRepository.createMany.mockImplementation((data) => data);

      const result = await useCase.execute({
        tipoConta: 'PAGAR',
        contaId: 'conta-1',
        quantidadeParcelas: 3,
      });

      expect(result).toHaveLength(3);
      result.forEach((installment, index) => {
        expect(installment.origem).toBe('PAGAR');
        expect(installment.origemId).toBe('conta-1');
        expect(installment.numeroParcela).toBe(index + 1);
        expect(installment.totalParcelas).toBe(3);
        expect(installment.valor).toBe(100);
      });
    });

    it('should call createMany within a transaction', async () => {
      accountPayableRepository.findById.mockResolvedValue({
        id: 'conta-1',
        valor: 200,
        dataVencimento: new Date('2024-01-15'),
      });
      installmentRepository.hasSettlements.mockResolvedValue(false);
      installmentRepository.createMany.mockImplementation((data) => data);

      await useCase.execute({
        tipoConta: 'PAGAR',
        contaId: 'conta-1',
        quantidadeParcelas: 2,
      });

      expect(connection).toHaveBeenCalled();
      expect(installmentRepository.createMany).toHaveBeenCalledWith(
        expect.any(Array),
        transaction,
      );
    });
  });
});
