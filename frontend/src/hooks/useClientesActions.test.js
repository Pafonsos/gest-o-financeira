// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { INITIAL_NOVO_CLIENTE, useClientesActions } from './useClientesActions';

vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    storage: {
      from: () => ({
        createSignedUrl: vi.fn(),
        upload: vi.fn(),
        remove: vi.fn()
      })
    },
    from: () => ({
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    })
  }
}));

describe('useClientesActions', () => {
  const baseParams = () => ({
    clientes: [],
    setClientes: vi.fn(),
    clienteSelecionado: null,
    setClienteSelecionado: vi.fn(),
    clienteEditando: null,
    setClienteEditando: vi.fn(),
    novoCliente: { ...INITIAL_NOVO_CLIENTE },
    setNovoCliente: vi.fn(),
    pagamentoForm: { valor: '', data: '2026-02-15', descricao: '' },
    setPagamentoForm: vi.fn(),
    setModalAberto: vi.fn(),
    setModalConfirmacao: vi.fn(),
    setModalPagamento: vi.fn(),
    showMessage: vi.fn(),
    setToast: vi.fn()
  });

  it('fecha modal e reseta formulario', () => {
    const params = baseParams();
    const { result } = renderHook(() => useClientesActions(params));

    act(() => {
      result.current.fecharModal();
    });

    expect(params.setModalAberto).toHaveBeenCalledWith(false);
    expect(params.setClienteEditando).toHaveBeenCalledWith(null);
    expect(params.setNovoCliente).toHaveBeenCalledWith(INITIAL_NOVO_CLIENTE);
  });

  it('valida campos obrigatorios ao adicionar', async () => {
    const params = baseParams();
    const { result } = renderHook(() => useClientesActions(params));

    await act(async () => {
      await result.current.adicionarCliente();
    });

    expect(params.showMessage).toHaveBeenCalledWith(expect.objectContaining({ title: 'Campos obrigatorios' }));
    expect(result.current.actionLoading.addCliente).toBe(false);
  });
});
