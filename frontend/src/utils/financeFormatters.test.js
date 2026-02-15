import { describe, expect, it } from 'vitest';
import {
  formatarCNPJ,
  formatarData,
  formatarMoeda,
  formatarMoedaInput,
  parseMoedaParaNumero
} from './financeFormatters';

describe('financeFormatters', () => {
  it('formata CNPJ progressivamente', () => {
    expect(formatarCNPJ('12345678000199')).toBe('12.345.678/0001-99');
    expect(formatarCNPJ('1234')).toBe('12.34');
  });

  it('formata valor de input monetario', () => {
    expect(formatarMoedaInput('12345')).toBe('123,45');
    expect(formatarMoedaInput('')).toBe('0,00');
  });

  it('converte string de moeda para numero', () => {
    expect(parseMoedaParaNumero('1.234,56')).toBe(1234.56);
    expect(parseMoedaParaNumero(200)).toBe(200);
    expect(parseMoedaParaNumero('')).toBe(0);
  });

  it('formata moeda BRL e data pt-BR', () => {
    expect(formatarMoeda(1234.56)).toContain('1.234,56');
    expect(formatarData('2026-02-15T12:00:00')).toBe('15/02/2026');
  });
});
