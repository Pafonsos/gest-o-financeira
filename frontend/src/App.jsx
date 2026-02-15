import React, { Suspense, lazy, useState, useEffect, useRef } from 'react';
import { DollarSign, Users, AlertCircle } from 'lucide-react';
import { EmailSettingsModal } from './components/EmailSettingsModal';
import ModalDespesa from './components/modals/ModalDespesa';
import DeleteConfirmModals from './components/modals/DeleteConfirmModals';
import PaymentModal from './components/modals/PaymentModal';
import ClientDetailsModal from './components/modals/ClientDetailsModal';
import ClientFormModal from './components/modals/ClientFormModal';
import { useClientesView } from './hooks/useClientesView.jsx';
import { useClientesExport } from './hooks/useClientesExport';
import { INITIAL_NOVO_CLIENTE, useClientesActions } from './hooks/useClientesActions';
import { useInitialData } from './hooks/useInitialData';
import { useFinancialUiState } from './hooks/useFinancialUiState';
import { mapDespesaFromDb, mapDespesaToDb } from './utils/clientDataMappers';
import {
  formatarCNPJ,
  formatarData,
  formatarMoeda,
  formatarMoedaInput
} from './utils/financeFormatters';
import { useAuth } from './contexts/AuthContext';
import ProfileMenu from './components/ProfileMenu';
import { AuthPage } from './pages/AuthPage';
import { useUI } from './contexts/UiContext';
import { supabase } from './lib/supabaseClient';

const DashboardAprimorado = lazy(() => import('./components/dashboard/DashboardAprimorado'));
const ClientsSection = lazy(() => import('./components/clients/ClientsSection'));
const ExpensesSection = lazy(() => import('./components/expenses/ExpensesSection')); 

const FinancialManager = () => {
  const { user, loading } = useAuth();
  const { showMessage } = useUI();
  const {
    state: ui,
    setShowEmailSettings,
    setModalAberto,
    setAbaAtiva,
    setModalPagamento,
    setModalDetalhes,
    setModalConfirmacao,
    setModalConfirmacaoTodos,
    setModalDespesa,
    setClienteEditando,
    setClienteSelecionado,
    setToast
  } = useFinancialUiState();

  const {
    showEmailSettings,
    modalAberto,
    abaAtiva,
    modalPagamento,
    modalDetalhes,
    modalConfirmacao,
    modalConfirmacaoTodos,
    modalDespesa,
    clienteEditando,
    clienteSelecionado,
    toast
  } = ui;

  // Estado inicial vazio - será carregado do Supabase
  const [clientes, setClientes] = useState([]);

  const [filtros, setFiltros] = useState({
    status: 'todos',
    busca: ''
  });

  const [pagamentoForm, setPagamentoForm] = useState({
    valor: '',
    data: new Date().toISOString().split('T')[0],
    descricao: ''
  });

  // Estado para Contas a Pagar - INDEPENDENTE DO DASHBOARD
  const [despesas, setDespesas] = useState([]);
  const clientesTableRef = useRef(null);
  const clientesDragStateRef = useRef({ dragging: false, startX: 0, startScrollLeft: 0 });

  const handleClientesTableMouseDown = (event) => {
    const container = clientesTableRef.current;
    if (!container) return;
    clientesDragStateRef.current = {
      dragging: true,
      startX: event.clientX,
      startScrollLeft: container.scrollLeft
    };
  };

  const handleClientesTableMouseMove = (event) => {
    const container = clientesTableRef.current;
    const dragState = clientesDragStateRef.current;
    if (!container || !dragState.dragging) return;
    const delta = event.clientX - dragState.startX;
    container.scrollLeft = dragState.startScrollLeft - delta;
  };

  const handleClientesTableMouseUp = () => {
    clientesDragStateRef.current.dragging = false;
  };

  const [novoCliente, setNovoCliente] = useState(INITIAL_NOVO_CLIENTE);

  const {
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
  } = useClientesActions({
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
  });

  useInitialData({
    setClientes,
    setDespesas,
    createSignedContratoUrl
  });

  // Toast discreto (auto-hide)
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  const {
    calcularStatus,
    calcularDiasAtraso,
    clientesFiltrados,
    totais,
    getStatusColor,
    getStatusIcon,
    getStatusText
  } = useClientesView(clientes, filtros);

  const {
    exportarRelatorio,
    exportarClientesPDF,
    exportarGoogleSheets,
    exportLoading
  } = useClientesExport({
    clientes,
    clientesFiltrados,
    calcularStatus,
    calcularDiasAtraso,
    getStatusText,
    formatarMoeda,
    showMessage
  });

  // Se ainda está carregando, mostra loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não está autenticado, mostra página de login
  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="w-full p-6">
        {/* Header Simplificado */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 mb-8 shadow-md">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="text-white">
              <img
                src="/logo-proteq.png"
                alt="PROTEQ Logo"
                className="w-50 h-20 object-contain"
                onError={(e) => e.target.style.display = 'none'}
              />
            </div>
            
            {/* Perfil */}
            <ProfileMenu />
          </div>
        </div>
        
        {/* NAVEGAÇÃO POR ABAS */}
        <div className="flex gap-2 bg-white rounded-lg p-2 mb-6 shadow-md" role="tablist" aria-label="Navegacao principal">
          <button
            onClick={() => setAbaAtiva('dashboard')}
            aria-label="Abrir aba Dashboard"
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 font-medium ${
              abaAtiva === 'dashboard'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <DollarSign className="w-5 h-5" />
            Dashboard
          </button>
          
          <button
            onClick={() => setAbaAtiva('clientes')}
            aria-label="Abrir aba Clientes"
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 font-medium ${
              abaAtiva === 'clientes'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Users className="w-5 h-5" />
            Clientes
          </button>

          <button
            onClick={() => setAbaAtiva('despesas')}
            aria-label="Abrir aba Contas a Pagar"
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 font-medium ${
              abaAtiva === 'despesas'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <AlertCircle className="w-5 h-5" />
            Contas a Pagar
          </button>
        </div>

        {/* CONTEDO DAS ABAS */}
        {toast && (
          <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-lg text-sm z-50" role="status" aria-live="polite">
            {toast}
          </div>
        )}
        {abaAtiva === 'dashboard' && (
          <Suspense fallback={<div className="bg-white rounded-lg shadow p-6">Carregando dashboard...</div>}>
            <DashboardAprimorado clientes={clientes} />
          </Suspense>
        )}

        {abaAtiva === 'clientes' && (
          <Suspense fallback={<div className="bg-white rounded-lg shadow p-6">Carregando clientes...</div>}>
            <ClientsSection
              exportarGoogleSheets={exportarGoogleSheets}
              exportarRelatorio={exportarRelatorio}
              exportarClientesPDF={exportarClientesPDF}
              exportLoading={exportLoading}
              actionLoading={actionLoading}
              onOpenEmailSettings={() => setShowEmailSettings(true)}
              onDeleteAll={() => setModalConfirmacaoTodos(true)}
              totais={totais}
              formatarMoeda={formatarMoeda}
              clientes={clientes}
              filtros={filtros}
              setFiltros={setFiltros}
              onAddClient={() => setModalAberto(true)}
              clientesTableRef={clientesTableRef}
              onTableMouseDown={handleClientesTableMouseDown}
              onTableMouseMove={handleClientesTableMouseMove}
              onTableMouseUp={handleClientesTableMouseUp}
              clientesFiltrados={clientesFiltrados}
              calcularStatus={calcularStatus}
              calcularDiasAtraso={calcularDiasAtraso}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
              getStatusText={getStatusText}
              formatarData={formatarData}
              onViewClient={(cliente) => {
                setClienteSelecionado(cliente);
                setModalDetalhes(true);
              }}
              onRegisterPayment={(cliente) => {
                setClienteSelecionado(cliente);
                setPagamentoForm({
                  valor: cliente.valorParcela.toString(),
                  data: new Date().toISOString().split('T')[0],
                  descricao: `${cliente.parcelasPagas + 1}ª parcela`
                });
                setModalPagamento(true);
              }}
              onEditClient={(cliente) => {
                setClienteEditando({ ...cliente });
                setModalAberto(true);
              }}
              onDeleteClient={(cliente) => {
                setClienteSelecionado(cliente);
                setModalConfirmacao(true);
              }}
            />
          </Suspense>
        )}

      {abaAtiva === 'pipefy' && null}

      {/* Modais */}
        <ClientFormModal
          isOpen={modalAberto}
          clienteEditando={clienteEditando}
          novoCliente={novoCliente}
          setClienteEditando={setClienteEditando}
          setNovoCliente={setNovoCliente}
          formatarCNPJ={formatarCNPJ}
          formatarMoedaInput={formatarMoedaInput}
          handleContratoChange={handleContratoChange}
          onClose={fecharModal}
          onSubmit={clienteEditando ? editarCliente : adicionarCliente}
          isSubmitting={clienteEditando ? actionLoading.editCliente : actionLoading.addCliente}
        />

        <PaymentModal
          isOpen={modalPagamento}
          clienteSelecionado={clienteSelecionado}
          pagamentoForm={pagamentoForm}
          setPagamentoForm={setPagamentoForm}
          formatarMoeda={formatarMoeda}
          onClose={() => {
            setModalPagamento(false);
            setClienteSelecionado(null);
            setPagamentoForm({
              valor: '',
              data: new Date().toISOString().split('T')[0],
              descricao: ''
            });
          }}
          onConfirm={registrarPagamento}
          isSubmitting={actionLoading.registrarPagamento}
        />

        <ClientDetailsModal
          isOpen={modalDetalhes}
          clienteSelecionado={clienteSelecionado}
          formatarMoeda={formatarMoeda}
          formatarData={formatarData}
          onRemoveLastPayment={removerUltimoPagamento}
          onClose={() => {
            setModalDetalhes(false);
            setClienteSelecionado(null);
          }}
        />

        {/* ModalDespesa - Adicionar nova despesa */}
        <ModalDespesa
          isOpen={modalDespesa}
          onClose={() => setModalDespesa(false)}
          onSave={async (novaDespesa) => {
            try {
              const payload = mapDespesaToDb({ ...novaDespesa, id: undefined });
              const { data, error } = await supabase
                .from('despesas')
                .insert([payload])
                .select('*')
                .single();

              if (error) throw error;

              setDespesas([...despesas, mapDespesaFromDb(data)]);
              setModalDespesa(false);
            } catch (error) {
              showMessage({
                title: 'Erro ao salvar despesa',
                message: error.message || 'Não foi possível salvar no Supabase.',
                type: 'error'
              });
            }
          }}
        />
        <DeleteConfirmModals
          isSingleOpen={modalConfirmacao}
          selectedClientName={clienteSelecionado?.nomeEmpresa}
          onCancelSingle={() => {
            setModalConfirmacao(false);
            setClienteSelecionado(null);
          }}
          onConfirmSingle={excluirCliente}
          isAllOpen={modalConfirmacaoTodos}
          onCancelAll={() => setModalConfirmacaoTodos(false)}
          onConfirmAll={() => {
            setModalConfirmacaoTodos(false);
            excluirTodosClientes();
          }}
        />
        
        {abaAtiva === 'despesas' && (
          <Suspense fallback={<div className="bg-white rounded-lg shadow p-6">Carregando despesas...</div>}>
            <ExpensesSection
              despesas={despesas}
              formatarMoeda={formatarMoeda}
              formatarData={formatarData}
              onAddDespesa={() => setModalDespesa(true)}
            />
          </Suspense>
        )}
        
        {/* Modal de Configurações de Email */}
        <EmailSettingsModal 
          isOpen={showEmailSettings} 
          onClose={() => setShowEmailSettings(false)} 
        />
      </div>
    </div>
  );
};

export default FinancialManager;

























