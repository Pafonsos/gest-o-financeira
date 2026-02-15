import { describe, expect, it } from 'vitest';
import {
  mapClientFromDb,
  mapClientToDb,
  mapDespesaFromDb,
  mapDespesaToDb
} from './clientDataMappers';

describe('clientDataMappers', () => {
  it('mapeia cliente do banco para o formato de view', () => {
    const mapped = mapClientFromDb({
      id: 'abc',
      nome_responsavel: 'Maria',
      nome_empresa: 'Empresa X',
      valor_total: '1000',
      valor_pago: '250',
      contrato_data_url: 'data:application/pdf;base64,abc'
    });

    expect(mapped.nomeResponsavel).toBe('Maria');
    expect(mapped.valorTotal).toBe(1000);
    expect(mapped.valorPago).toBe(250);
    expect(mapped.contratoPath).toBe('');
    expect(mapped.contratoDataUrl).toContain('data:application/pdf');
  });

  it('mapeia cliente para payload do banco com id uuid valido', () => {
    const payload = mapClientToDb({
      id: '123e4567-e89b-12d3-a456-426614174000',
      nomeResponsavel: 'Maria',
      nomeEmpresa: 'Empresa X',
      valorTotal: '1500',
      parcelas: 3
    });

    expect(payload.id).toBe('123e4567-e89b-12d3-a456-426614174000');
    expect(payload.nome_responsavel).toBe('Maria');
    expect(payload.valor_total).toBe(1500);
    expect(payload.parcelas).toBe(3);
  });

  it('mapeia despesa ida e volta', () => {
    const fromDb = mapDespesaFromDb({
      id: 'd1',
      fornecedor: 'Fornecedor',
      valor: '50',
      pago: 1
    });

    expect(fromDb.valor).toBe(50);
    expect(fromDb.pago).toBe(true);

    const toDb = mapDespesaToDb(fromDb);
    expect(toDb.valor).toBe(50);
    expect(toDb.pago).toBe(true);
    expect(toDb.fornecedor).toBe('Fornecedor');
  });
});
