import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { mapClientFromDb, mapClientToDb } from '../utils/clientDataMappers';
import { formatarData, parseMoedaParaNumero } from '../utils/financeFormatters';

export const INITIAL_NOVO_CLIENTE = {
  nomeResponsavel: '',
  nomeEmpresa: '',
  nomeFantasia: '',
  email: '',
  telefone: '',
  valorTotal: '',
  parcelas: 1,
  dataVenda: '',
  proximoVencimento: '',
  cnpj: '',
  codigoContrato: '',
  contratoNome: '',
  contratoDataUrl: '',
  contratoPath: '',
  contratoArquivo: null,
  contratoRemover: false,
  linkPagamento: '',
  observacoes: ''
};

export const useClientesActions = ({
  clientes,
  setClientes,
  clienteSelecionado,
  setClienteSelecionado,
  clienteEditando,
  setClienteEditando,
  novoCliente,
  setNovoCliente,
  pagamentoForm,
  setPagamentoForm,
  setModalAberto,
  setModalConfirmacao,
  setModalPagamento,
  showMessage,
  setToast
}) => {
  const [actionLoading, setActionLoading] = useState({
    addCliente: false,
    editCliente: false,
    deleteCliente: false,
    deleteAllClientes: false,
    registrarPagamento: false,
    removerPagamento: false
  });

  const setLoading = useCallback((field, value) => {
    setActionLoading((prev) => ({ ...prev, [field]: value }));
  }, []);

  const createSignedContratoUrl = useCallback(async (path) => {
    if (!path) return '';

    const { data, error } = await supabase
      .storage
      .from('contratos')
      .createSignedUrl(path, 60 * 60 * 24 * 7);

    if (error) throw error;
    return data?.signedUrl || '';
  }, []);

  const uploadContrato = useCallback(async (file, clientId) => {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `clientes/${clientId}/${Date.now()}_${safeName}`;

    const { error: uploadError } = await supabase
      .storage
      .from('contratos')
      .upload(path, file, { upsert: true });

    if (uploadError) throw uploadError;

    const signedUrl = await createSignedContratoUrl(path);
    return { path, signedUrl };
  }, [createSignedContratoUrl]);

  const deleteContrato = useCallback(async (path) => {
    if (!path) return;
    await supabase.storage.from('contratos').remove([path]);
  }, []);

  const fecharModal = useCallback(() => {
    setModalAberto(false);
    setClienteEditando(null);
    setNovoCliente(INITIAL_NOVO_CLIENTE);
  }, [setClienteEditando, setModalAberto, setNovoCliente]);

  const handleContratoChange = useCallback((file, isEditing) => {
    if (!file) {
      if (isEditing) {
        setClienteEditando({
          ...clienteEditando,
          contratoNome: '',
          contratoDataUrl: '',
          contratoArquivo: null,
          contratoRemover: true
        });
      } else {
        setNovoCliente({
          ...novoCliente,
          contratoNome: '',
          contratoDataUrl: '',
          contratoPath: '',
          contratoArquivo: null,
          contratoRemover: false
        });
      }
      return;
    }

    const payload = {
      contratoNome: file.name,
      contratoArquivo: file,
      contratoRemover: false
    };

    if (isEditing) {
      setClienteEditando({
        ...clienteEditando,
        ...payload
      });
      return;
    }

    setNovoCliente({
      ...novoCliente,
      ...payload
    });
  }, [clienteEditando, novoCliente, setClienteEditando, setNovoCliente]);

  const adicionarCliente = useCallback(async () => {
    if (!novoCliente.nomeResponsavel || !novoCliente.nomeEmpresa || !novoCliente.valorTotal) {
      showMessage({
        title: 'Campos obrigatorios',
        message: 'Por favor, preencha os campos obrigatorios.',
        type: 'warning'
      });
      return;
    }

    const valorNumerico = parseMoedaParaNumero(novoCliente.valorTotal);
    const valorParcela = valorNumerico / parseInt(novoCliente.parcelas, 10);
    const novoId = Math.max(...clientes.map((c) => c.id), 0) + 1;

    const cliente = {
      ...novoCliente,
      id: novoId,
      valorTotal: valorNumerico,
      valorPago: 0,
      parcelasPagas: 0,
      valorParcela,
      parcelas: parseInt(novoCliente.parcelas, 10),
      historicosPagamentos: []
    };

    setLoading('addCliente', true);
    try {
      const payload = mapClientToDb({ ...cliente, id: undefined });
      const { data, error } = await supabase
        .from('clientes')
        .insert([payload])
        .select('*')
        .single();

      if (error) throw error;
      let savedClient = mapClientFromDb(data);

      if (novoCliente.contratoArquivo) {
        try {
          const uploadResult = await uploadContrato(novoCliente.contratoArquivo, savedClient.id);
          const { data: updated, error: updateError } = await supabase
            .from('clientes')
            .update({
              contrato_nome: novoCliente.contratoNome || novoCliente.contratoArquivo.name,
              contrato_data_url: uploadResult.path
            })
            .eq('id', savedClient.id)
            .select('*')
            .single();

          if (updateError) throw updateError;

          savedClient = {
            ...mapClientFromDb(updated),
            contratoDataUrl: uploadResult.signedUrl
          };
        } catch (uploadError) {
          showMessage({
            title: 'Contrato não enviado',
            message: uploadError.message || 'Não foi possível enviar o contrato para o storage.',
            type: 'warning'
          });
        }
      }

      setClientes([...clientes, savedClient]);
      fecharModal();
      setToast('Cliente adicionado com sucesso!');
    } catch (error) {
      showMessage({
        title: 'Erro ao salvar cliente',
        message: error.message || 'Não foi possível salvar no Supabase.',
        type: 'error'
      });
    } finally {
      setLoading('addCliente', false);
    }
  }, [clientes, fecharModal, novoCliente, setClientes, setLoading, setToast, showMessage, uploadContrato]);

  const editarCliente = useCallback(async () => {
    if (!clienteEditando?.nomeResponsavel || !clienteEditando?.nomeEmpresa || !clienteEditando?.valorTotal) {
      showMessage({
        title: 'Campos obrigatorios',
        message: 'Por favor, preencha os campos obrigatorios.',
        type: 'warning'
      });
      return;
    }

    const valorNumerico = typeof clienteEditando.valorTotal === 'number'
      ? clienteEditando.valorTotal
      : parseMoedaParaNumero(clienteEditando.valorTotal);

    const valorParcela = valorNumerico / parseInt(clienteEditando.parcelas, 10);

    const atualizado = {
      ...clienteEditando,
      valorTotal: valorNumerico,
      valorParcela,
      parcelas: parseInt(clienteEditando.parcelas, 10)
    };

    setLoading('editCliente', true);
    try {
      const payload = mapClientToDb(atualizado);
      const { data, error } = await supabase
        .from('clientes')
        .update(payload)
        .eq('id', clienteEditando.id)
        .select('*')
        .single();

      if (error) throw error;
      let savedClient = mapClientFromDb(data);

      if (clienteEditando.contratoRemover && clienteEditando.contratoPath) {
        await deleteContrato(clienteEditando.contratoPath);
        const { data: cleared, error: clearError } = await supabase
          .from('clientes')
          .update({
            contrato_nome: null,
            contrato_data_url: null
          })
          .eq('id', clienteEditando.id)
          .select('*')
          .single();

        if (!clearError && cleared) {
          savedClient = mapClientFromDb(cleared);
        }
      }

      if (clienteEditando.contratoArquivo) {
        try {
          const uploadResult = await uploadContrato(clienteEditando.contratoArquivo, clienteEditando.id);
          const { data: updated, error: updateError } = await supabase
            .from('clientes')
            .update({
              contrato_nome: clienteEditando.contratoNome || clienteEditando.contratoArquivo.name,
              contrato_data_url: uploadResult.path
            })
            .eq('id', clienteEditando.id)
            .select('*')
            .single();

          if (updateError) throw updateError;

          savedClient = {
            ...mapClientFromDb(updated),
            contratoDataUrl: uploadResult.signedUrl
          };
        } catch (uploadError) {
          showMessage({
            title: 'Contrato não enviado',
            message: uploadError.message || 'Não foi possível enviar o contrato para o storage.',
            type: 'warning'
          });
        }
      }

      if (savedClient.contratoPath && !savedClient.contratoDataUrl) {
        try {
          const signedUrl = await createSignedContratoUrl(savedClient.contratoPath);
          savedClient = { ...savedClient, contratoDataUrl: signedUrl };
        } catch {
          // keep original client if sign url fails
        }
      }

      setClientes(clientes.map((cliente) => (
        cliente.id === clienteEditando.id ? savedClient : cliente
      )));
      fecharModal();
      setToast('Cliente editado com sucesso!');
    } catch (error) {
      showMessage({
        title: 'Erro ao atualizar cliente',
        message: error.message || 'Não foi possível salvar no Supabase.',
        type: 'error'
      });
    } finally {
      setLoading('editCliente', false);
    }
  }, [
    clienteEditando,
    clientes,
    createSignedContratoUrl,
    deleteContrato,
    fecharModal,
    setClientes,
    setLoading,
    setToast,
    showMessage,
    uploadContrato
  ]);

  const excluirCliente = useCallback(async () => {
    if (!clienteSelecionado?.id) return;

    setLoading('deleteCliente', true);
    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', clienteSelecionado.id);

      if (error) throw error;

      setClientes(clientes.filter((cliente) => cliente.id !== clienteSelecionado.id));
      setModalConfirmacao(false);
      setClienteSelecionado(null);
      setToast('Cliente excluído.');
    } catch (error) {
      showMessage({
        title: 'Erro ao excluir cliente',
        message: error.message || 'Não foi possível excluir no Supabase.',
        type: 'error'
      });
    } finally {
      setLoading('deleteCliente', false);
    }
  }, [clienteSelecionado, clientes, setClienteSelecionado, setClientes, setLoading, setModalConfirmacao, setToast, showMessage]);

  const excluirTodosClientes = useCallback(async () => {
    setLoading('deleteAllClientes', true);
    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .not('id', 'is', null);

      if (error) throw error;

      setClientes([]);
      setToast('Todos os clientes foram excluídos.');
    } catch (error) {
      showMessage({
        title: 'Erro ao excluir todos',
        message: error.message || 'Não foi possível excluir no Supabase.',
        type: 'error'
      });
    } finally {
      setLoading('deleteAllClientes', false);
    }
  }, [setClientes, setLoading, setToast, showMessage]);

  const registrarPagamento = useCallback(async () => {
    const valorPago = parseFloat(pagamentoForm.valor);
    if (!valorPago || valorPago <= 0) {
      showMessage({
        title: 'Valor inválido',
        message: 'Por favor, insira um valor válido.',
        type: 'warning'
      });
      return;
    }

    if (!clienteSelecionado) return;

    let atualizado = null;
    const updatedClientes = clientes.map((cliente) => {
      if (cliente.id === clienteSelecionado.id) {
        const novoValorPago = cliente.valorPago + valorPago;
        const novasParcelasPagas = Math.floor(novoValorPago / cliente.valorParcela);
        const novoHistorico = [
          ...(cliente.historicosPagamentos || []),
          {
            data: pagamentoForm.data,
            valor: valorPago,
            descricao: pagamentoForm.descricao || `Pagamento - ${formatarData(pagamentoForm.data)}`
          }
        ];

        let novoProximoVencimento = cliente.proximoVencimento;
        if (novasParcelasPagas > cliente.parcelasPagas && cliente.proximoVencimento) {
          const dataAtual = new Date(cliente.proximoVencimento);
          const parcelasPagasAMais = novasParcelasPagas - cliente.parcelasPagas;
          dataAtual.setDate(dataAtual.getDate() + (30 * parcelasPagasAMais));
          novoProximoVencimento = dataAtual.toISOString().split('T')[0];
        }

        atualizado = {
          ...cliente,
          valorPago: novoValorPago,
          parcelasPagas: novasParcelasPagas,
          proximoVencimento: novoProximoVencimento,
          historicosPagamentos: novoHistorico
        };
        return atualizado;
      }
      return cliente;
    });

    if (atualizado) {
      setLoading('registrarPagamento', true);
      try {
        const payload = mapClientToDb(atualizado);
        const { data, error } = await supabase
          .from('clientes')
          .update(payload)
          .eq('id', atualizado.id)
          .select('*')
          .single();

        if (error) throw error;

        setClientes(updatedClientes.map((cliente) => (
          cliente.id === atualizado.id ? mapClientFromDb(data) : cliente
        )));
      } catch (error) {
        showMessage({
          title: 'Erro ao salvar pagamento',
          message: error.message || 'Não foi possível atualizar no Supabase.',
          type: 'error'
        });
        return;
      } finally {
        setLoading('registrarPagamento', false);
      }
    }

    setModalPagamento(false);
    setPagamentoForm({
      valor: '',
      data: new Date().toISOString().split('T')[0],
      descricao: ''
    });
    setClienteSelecionado(null);
    setToast('Pagamento registrado com sucesso!');
  }, [
    clienteSelecionado,
    clientes,
    pagamentoForm,
    setClienteSelecionado,
    setClientes,
    setLoading,
    setModalPagamento,
    setPagamentoForm,
    setToast,
    showMessage
  ]);

  const removerUltimoPagamento = useCallback(async () => {
    if (!clienteSelecionado) return;

    const historico = Array.isArray(clienteSelecionado.historicosPagamentos)
      ? clienteSelecionado.historicosPagamentos
      : [];

    if (historico.length === 0) return;

    const ultimoPagamento = historico[historico.length - 1];
    const valorUltimo = Number(ultimoPagamento?.valor || 0);
    const novoHistorico = historico.slice(0, -1);
    const novoValorPago = Math.max(0, Number(clienteSelecionado.valorPago || 0) - valorUltimo);

    let novasParcelasPagas = 0;
    if (Number(clienteSelecionado.valorParcela || 0) > 0) {
      novasParcelasPagas = Math.max(
        0,
        Math.floor(novoValorPago / Number(clienteSelecionado.valorParcela))
      );
    } else {
      novasParcelasPagas = Math.max(0, Number(clienteSelecionado.parcelasPagas || 0) - 1);
    }

    let novoProximoVencimento = clienteSelecionado.proximoVencimento || null;
    const diffParcelas = Number(clienteSelecionado.parcelasPagas || 0) - novasParcelasPagas;
    if (diffParcelas > 0 && clienteSelecionado.proximoVencimento) {
      const dataAtual = new Date(clienteSelecionado.proximoVencimento);
      dataAtual.setDate(dataAtual.getDate() - (30 * diffParcelas));
      novoProximoVencimento = dataAtual.toISOString().split('T')[0];
    }

    const atualizado = {
      ...clienteSelecionado,
      valorPago: novoValorPago,
      parcelasPagas: novasParcelasPagas,
      proximoVencimento: novoProximoVencimento,
      historicosPagamentos: novoHistorico
    };

    setLoading('removerPagamento', true);
    try {
      const payload = mapClientToDb(atualizado);
      const { data, error } = await supabase
        .from('clientes')
        .update(payload)
        .eq('id', atualizado.id)
        .select('*')
        .single();

      if (error) throw error;

      const salvo = mapClientFromDb(data);
      setClientes((prev) => prev.map((cliente) => (
        cliente.id === salvo.id ? salvo : cliente
      )));
      setClienteSelecionado(salvo);
      setToast('Último pagamento removido.');
    } catch (error) {
      showMessage({
        title: 'Erro ao remover pagamento',
        message: error.message || 'Não foi possível reverter o pagamento.',
        type: 'error'
      });
    } finally {
      setLoading('removerPagamento', false);
    }
  }, [clienteSelecionado, setClienteSelecionado, setClientes, setLoading, setToast, showMessage]);

  return {
    createSignedContratoUrl,
    handleContratoChange,
    adicionarCliente,
    editarCliente,
    excluirCliente,
    excluirTodosClientes,
    registrarPagamento,
    removerUltimoPagamento,
    fecharModal,
    actionLoading
  };
};
