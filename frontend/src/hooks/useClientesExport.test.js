// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useClientesExport } from './useClientesExport';

describe('useClientesExport', () => {
  it('avisa quando nao ha clientes para CSV', () => {
    const showMessage = vi.fn();

    const { result } = renderHook(() => useClientesExport({
      clientes: [],
      clientesFiltrados: [],
      calcularStatus: () => 'pendente',
      calcularDiasAtraso: () => 0,
      getStatusText: () => 'Pendente',
      formatarMoeda: (v) => String(v),
      showMessage
    }));

    act(() => {
      result.current.exportarRelatorio();
    });

    expect(showMessage).toHaveBeenCalledWith(expect.objectContaining({ title: 'Sem dados' }));
    expect(result.current.exportLoading.csv).toBe(false);
  });

  it('exporta para sheets e exibe sucesso', async () => {
    const showMessage = vi.fn();
    const writeText = vi.fn().mockResolvedValue(undefined);
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText }
    });

    const { result } = renderHook(() => useClientesExport({
      clientes: [{ id: 1, nomeEmpresa: 'Empresa', valorTotal: 10, valorPago: 0, proximoVencimento: '' }],
      clientesFiltrados: [],
      calcularStatus: () => 'pendente',
      calcularDiasAtraso: () => 0,
      getStatusText: () => 'Pendente',
      formatarMoeda: (v) => String(v),
      showMessage
    }));

    await act(async () => {
      result.current.exportarGoogleSheets();
      await Promise.resolve();
    });

    expect(writeText).toHaveBeenCalled();
    expect(openSpy).toHaveBeenCalled();
    expect(showMessage).toHaveBeenCalledWith(expect.objectContaining({ title: 'Dados copiados' }));
    openSpy.mockRestore();
  });
});
