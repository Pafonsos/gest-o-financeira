// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useInitialData } from './useInitialData';

const chain = (result) => ({
  select: vi.fn().mockReturnThis(),
  order: vi.fn().mockResolvedValue(result),
  insert: vi.fn().mockReturnValue({ select: vi.fn().mockResolvedValue(result) })
});

vi.mock('../lib/supabaseClient', () => {
  const clientsResult = {
    data: [{ id: '1', nome_responsavel: 'Ana', nome_empresa: 'Empresa', contrato_data_url: 'path/arquivo.pdf' }],
    error: null
  };
  const despesasResult = {
    data: [{ id: 'd1', fornecedor: 'Forn', valor: 10, pago: false }],
    error: null
  };

  return {
    supabase: {
      from: vi.fn((table) => (table === 'clientes' ? chain(clientsResult) : chain(despesasResult)))
    }
  };
});

describe('useInitialData', () => {
  it('carrega clientes e despesas iniciais', async () => {
    const setClientes = vi.fn();
    const setDespesas = vi.fn();
    const createSignedContratoUrl = vi.fn().mockResolvedValue('https://signed-url');

    renderHook(() => useInitialData({ setClientes, setDespesas, createSignedContratoUrl }));

    await waitFor(() => {
      expect(setClientes).toHaveBeenCalled();
      expect(setDespesas).toHaveBeenCalled();
    });

    const clientesArg = setClientes.mock.calls[0][0];
    expect(clientesArg[0].contratoDataUrl).toBe('https://signed-url');
  });
});
