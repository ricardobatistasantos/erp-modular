import {
  InstallmentCalculator,
  InstallmentCalculationInput,
} from '../domain/services/installment-calculator';

describe('InstallmentCalculator', () => {
  let calculator: InstallmentCalculator;

  beforeEach(() => {
    calculator = new InstallmentCalculator();
  });

  describe('calculate() - Distribuição Proporcional', () => {
    it('deve dividir valor igualmente entre parcelas', () => {
      const input: InstallmentCalculationInput = {
        valorTotal: 300,
        quantidadeParcelas: 3,
        dataVencimentoBase: new Date('2024-01-15'),
      };

      const result = calculator.calculate(input);

      expect(result).toHaveLength(3);
      expect(result[0].valor).toBe(100);
      expect(result[1].valor).toBe(100);
      expect(result[2].valor).toBe(100);
    });

    it('deve truncar em 2 casas e adicionar resíduo na última parcela', () => {
      const input: InstallmentCalculationInput = {
        valorTotal: 100,
        quantidadeParcelas: 3,
        dataVencimentoBase: new Date('2024-01-15'),
      };

      const result = calculator.calculate(input);

      expect(result[0].valor).toBe(33.33);
      expect(result[1].valor).toBe(33.33);
      expect(result[2].valor).toBe(33.34);

      const soma = result.reduce((acc, p) => acc + p.valor, 0);
      expect(Math.round(soma * 100) / 100).toBe(100);
    });

    it('deve gerar parcela única quando quantidadeParcelas = 1', () => {
      const input: InstallmentCalculationInput = {
        valorTotal: 1500.5,
        quantidadeParcelas: 1,
        dataVencimentoBase: new Date('2024-03-10'),
      };

      const result = calculator.calculate(input);

      expect(result).toHaveLength(1);
      expect(result[0].valor).toBe(1500.5);
      expect(result[0].numeroParcela).toBe(1);
    });

    it('deve rejeitar quando valor/quantidade < 0.01', () => {
      const input: InstallmentCalculationInput = {
        valorTotal: 0.01,
        quantidadeParcelas: 2,
        dataVencimentoBase: new Date('2024-01-15'),
      };

      expect(() => calculator.calculate(input)).toThrow(
        'Valor total insuficiente para a quantidade de parcelas solicitada',
      );
    });

    it('deve usar intervaloMeses padrão de 1 quando não informado', () => {
      const input: InstallmentCalculationInput = {
        valorTotal: 200,
        quantidadeParcelas: 2,
        dataVencimentoBase: new Date('2024-01-15'),
      };

      const result = calculator.calculate(input);

      expect(result[0].dataVencimento).toEqual(new Date('2024-01-15'));
      expect(result[1].dataVencimento).toEqual(new Date('2024-02-15'));
    });

    it('deve respeitar intervaloMeses customizado', () => {
      const input: InstallmentCalculationInput = {
        valorTotal: 600,
        quantidadeParcelas: 3,
        dataVencimentoBase: new Date('2024-01-15'),
        intervaloMeses: 2,
      };

      const result = calculator.calculate(input);

      expect(result[0].dataVencimento).toEqual(new Date('2024-01-15'));
      expect(result[1].dataVencimento).toEqual(new Date('2024-03-15'));
      expect(result[2].dataVencimento).toEqual(new Date('2024-05-15'));
    });

    it('deve numerar parcelas sequencialmente a partir de 1', () => {
      const input: InstallmentCalculationInput = {
        valorTotal: 500,
        quantidadeParcelas: 5,
        dataVencimentoBase: new Date('2024-01-01'),
      };

      const result = calculator.calculate(input);

      result.forEach((parcela, i) => {
        expect(parcela.numeroParcela).toBe(i + 1);
      });
    });
  });

  describe('calculate() - Datas com último dia do mês', () => {
    it('deve ajustar 31/01 + 1 mês para 28/02 (ano não-bissexto)', () => {
      const input: InstallmentCalculationInput = {
        valorTotal: 200,
        quantidadeParcelas: 2,
        dataVencimentoBase: new Date('2023-01-31'),
      };

      const result = calculator.calculate(input);

      expect(result[0].dataVencimento).toEqual(new Date('2023-01-31'));
      expect(result[1].dataVencimento).toEqual(new Date('2023-02-28'));
    });

    it('deve ajustar 31/01 + 1 mês para 29/02 (ano bissexto)', () => {
      const input: InstallmentCalculationInput = {
        valorTotal: 200,
        quantidadeParcelas: 2,
        dataVencimentoBase: new Date('2024-01-31'),
      };

      const result = calculator.calculate(input);

      expect(result[0].dataVencimento).toEqual(new Date('2024-01-31'));
      expect(result[1].dataVencimento).toEqual(new Date('2024-02-29'));
    });

    it('deve ajustar 30/01 + 1 mês para 28/02 (ano não-bissexto)', () => {
      const input: InstallmentCalculationInput = {
        valorTotal: 200,
        quantidadeParcelas: 2,
        dataVencimentoBase: new Date('2023-01-30'),
      };

      const result = calculator.calculate(input);

      expect(result[1].dataVencimento).toEqual(new Date('2023-02-28'));
    });

    it('deve manter dia 15 ao adicionar meses', () => {
      const input: InstallmentCalculationInput = {
        valorTotal: 400,
        quantidadeParcelas: 4,
        dataVencimentoBase: new Date('2024-01-15'),
      };

      const result = calculator.calculate(input);

      expect(result[0].dataVencimento.getUTCDate()).toBe(15);
      expect(result[1].dataVencimento.getUTCDate()).toBe(15);
      expect(result[2].dataVencimento.getUTCDate()).toBe(15);
      expect(result[3].dataVencimento.getUTCDate()).toBe(15);
    });

    it('deve ajustar 31/03 + 1 mês para 30/04', () => {
      const input: InstallmentCalculationInput = {
        valorTotal: 200,
        quantidadeParcelas: 2,
        dataVencimentoBase: new Date('2024-03-31'),
      };

      const result = calculator.calculate(input);

      expect(result[1].dataVencimento).toEqual(new Date('2024-04-30'));
    });
  });

  describe('calculate() - Distribuição Personalizada', () => {
    it('deve usar valores informados diretamente', () => {
      const input: InstallmentCalculationInput = {
        valorTotal: 1000,
        quantidadeParcelas: 3,
        dataVencimentoBase: new Date('2024-01-15'),
        valores: [500, 300, 200],
      };

      const result = calculator.calculate(input);

      expect(result[0].valor).toBe(500);
      expect(result[1].valor).toBe(300);
      expect(result[2].valor).toBe(200);
    });

    it('deve usar datas personalizadas quando informadas', () => {
      const datas = [
        new Date('2024-01-10'),
        new Date('2024-03-15'),
        new Date('2024-06-20'),
      ];

      const input: InstallmentCalculationInput = {
        valorTotal: 900,
        quantidadeParcelas: 3,
        dataVencimentoBase: new Date('2024-01-01'),
        valores: [300, 300, 300],
        datasVencimento: datas,
      };

      const result = calculator.calculate(input);

      expect(result[0].dataVencimento).toEqual(new Date('2024-01-10'));
      expect(result[1].dataVencimento).toEqual(new Date('2024-03-15'));
      expect(result[2].dataVencimento).toEqual(new Date('2024-06-20'));
    });

    it('deve calcular datas com intervalo quando datasVencimento não informado', () => {
      const input: InstallmentCalculationInput = {
        valorTotal: 600,
        quantidadeParcelas: 3,
        dataVencimentoBase: new Date('2024-01-15'),
        valores: [200, 200, 200],
      };

      const result = calculator.calculate(input);

      expect(result[0].dataVencimento).toEqual(new Date('2024-01-15'));
      expect(result[1].dataVencimento).toEqual(new Date('2024-02-15'));
      expect(result[2].dataVencimento).toEqual(new Date('2024-03-15'));
    });
  });

  describe('recalculate()', () => {
    it('deve redistribuir valor restante entre parcelas pendentes', () => {
      const parcelasPendentes = [
        { numeroParcela: 3, dataVencimento: new Date('2024-03-15') },
        { numeroParcela: 4, dataVencimento: new Date('2024-04-15') },
        { numeroParcela: 5, dataVencimento: new Date('2024-05-15') },
      ];

      const result = calculator.recalculate(300, parcelasPendentes);

      expect(result).toHaveLength(3);
      expect(result[0].valor).toBe(100);
      expect(result[1].valor).toBe(100);
      expect(result[2].valor).toBe(100);
    });

    it('deve preservar numeroParcela e dataVencimento originais', () => {
      const parcelasPendentes = [
        { numeroParcela: 3, dataVencimento: new Date('2024-03-15') },
        { numeroParcela: 5, dataVencimento: new Date('2024-05-15') },
      ];

      const result = calculator.recalculate(200, parcelasPendentes);

      expect(result[0].numeroParcela).toBe(3);
      expect(result[0].dataVencimento).toEqual(new Date('2024-03-15'));
      expect(result[1].numeroParcela).toBe(5);
      expect(result[1].dataVencimento).toEqual(new Date('2024-05-15'));
    });

    it('deve truncar e adicionar resíduo na última parcela pendente', () => {
      const parcelasPendentes = [
        { numeroParcela: 2, dataVencimento: new Date('2024-02-15') },
        { numeroParcela: 3, dataVencimento: new Date('2024-03-15') },
        { numeroParcela: 4, dataVencimento: new Date('2024-04-15') },
      ];

      const result = calculator.recalculate(100, parcelasPendentes);

      expect(result[0].valor).toBe(33.33);
      expect(result[1].valor).toBe(33.33);
      expect(result[2].valor).toBe(33.34);

      const soma = result.reduce((acc, p) => acc + p.valor, 0);
      expect(Math.round(soma * 100) / 100).toBe(100);
    });

    it('deve rejeitar quando valor/quantidade < 0.01', () => {
      const parcelasPendentes = [
        { numeroParcela: 1, dataVencimento: new Date('2024-01-15') },
        { numeroParcela: 2, dataVencimento: new Date('2024-02-15') },
      ];

      expect(() => calculator.recalculate(0.01, parcelasPendentes)).toThrow(
        'Valor total insuficiente para a quantidade de parcelas solicitada',
      );
    });
  });
});
