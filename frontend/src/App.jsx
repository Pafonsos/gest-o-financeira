import React, { useState, useEffect } from 'react';
import { Plus, Search, DollarSign, Users, AlertCircle, CheckCircle, Clock, Filter, Edit, Trash2, Eye, Download, Mail, Send, Info, BarChart3, Settings } from 'lucide-react';
import emailService from './services/emailService';
import { EmailSettingsModal } from './components/EmailSettingsModal';
import DashboardAprimorado from './components/dashboard/DashboardAprimorado';
import ModalDespesa from './components/modals/ModalDespesa';
import { useAuth } from './contexts/AuthContext';
import ProfileMenu from './components/ProfileMenu';
import { AuthPage } from './pages/AuthPage';
import { useUI } from './contexts/UiContext';
import { supabase } from './lib/supabaseClient';

const EmailManager = ({ clientes }) => {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [subject, setSubject] = useState('');
  const [selectedClients, setSelectedClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showMessage } = useUI();

  const templates = [
    { value: 'primeira-cobranca', label: 'Primeira Cobrança (Notificação Inicial)', subject: 'Notificação de Pendência Financeira - PROTEQ' },
    { value: 'cobranca-7dias', label: 'Cobrança Leve (• 7 dias de atraso)', subject: 'Lembrete Amigável: Pagamento em Atraso - PROTEQ' },
    { value: 'cobranca-15dias', label: 'Cobrança Moderada (• 15 dias de atraso)', subject: 'Importante: Regularização Necessária - PROTEQ' },
    { value: 'cobranca-30dias', label: 'Cobrança Pesada (• 30 dias de atraso)', subject: 'URGENTE: Notificação Final - PROTEQ' },
    { value: 'solicitacao-contato', label: 'Cliente entrar em contato', subject: 'Entrar em contato conosco - PROTEQ' },
];
  const sendEmails = async () => {
  if (!selectedTemplate || !subject || selectedClients.length === 0) {
    showMessage({
      title: 'Dados incompletos',
      message: 'Preencha todos os campos e selecione pelo menos um cliente.',
      type: 'warning'
    });
    return;
  }

  // Funcoes auxiliares dentro do sendEmails
  const calcularStatus = (cliente) => {
    if (cliente.valorPago >= cliente.valorTotal) return 'pago';
    if (cliente.proximoVencimento && new Date(cliente.proximoVencimento) < new Date()) return 'em_atraso';
    return 'pendente';
  };

  const calcularDiasAtraso = (dataVencimento) => {
    if (!dataVencimento) return 0;
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    const diferenca = hoje - vencimento;
    return Math.max(0, Math.ceil(diferenca / (1000 * 60 * 60 * 24)));
  };

  const calcularParcelasEmAtraso = (cliente) => {
    const status = calcularStatus(cliente);
    if (status !== 'em_atraso') return 0;
    
    const parcelasRestantes = cliente.parcelas - cliente.parcelasPagas;
    const diasAtraso = calcularDiasAtraso(cliente.proximoVencimento);
    
    const parcelasAtrasadasEstimadas = Math.min(
      Math.ceil(diasAtraso / 30),
      parcelasRestantes
    );
    
    return parcelasAtrasadasEstimadas || 1;
  };

  setLoading(true);
  try {
    const recipients = selectedClients.map(id => {
      const cliente = clientes.find(c => c.id === id);
      const parcelasAtraso = calcularParcelasEmAtraso(cliente);
      
      const recipient = {
        email: cliente.email || 'cliente@exemplo.com',
        nomeResponsavel: cliente.nomeResponsavel,
        nomeEmpresa: cliente.nomeEmpresa,
        cnpj: cliente.cnpj || 'não informado',
        valorPendente: `R$ ${(cliente.valorTotal - cliente.valorPago).toFixed(2).replace('.', ',')}`,
        parcelasAtraso: parcelasAtraso > 1 ? `${parcelasAtraso} parcelas` : '1 parcela',
        proximoVencimento: cliente.proximoVencimento || 'não informado',
        linkPagamento: cliente.linkPagamento || '#'
      };

      return recipient;
    });
    const response = await emailService.sendBulkEmails({
      recipients,
      subject,
      template: selectedTemplate
    });

    if (response.success) {
      showMessage({
        title: 'Emails enviados',
        message: `${response.statistics.successful} enviados, ${response.statistics.failed} falhas. Taxa: ${response.statistics.successRate}`,
        type: 'success'
      });
      setSelectedClients([]);
      setSubject('');
      setSelectedTemplate('');
    }
  } catch (error) {
    showMessage({
      title: 'Erro ao enviar emails',
      message: error.response?.data?.message || error.message,
      type: 'error'
    });
  } finally {
    setLoading(false);
  }
};

  const handleTemplateChange = (template) => {
    setSelectedTemplate(template);
    const templateData = templates.find(t => t.value === template);
    if (templateData && !subject) {
      setSubject(templateData.subject);
    }
  };

  const handleClientToggle = (clientId) => {
    if (selectedClients.includes(clientId)) {
      setSelectedClients(selectedClients.filter(id => id !== clientId));
    } else {
      setSelectedClients([...selectedClients, clientId]);
    }
  };

  const getClientStatus = (cliente) => {
    if (cliente.valorPago >= cliente.valorTotal) return { text: 'Pago', color: 'bg-green-100 text-green-800' };
    if (cliente.proximoVencimento && new Date(cliente.proximoVencimento) < new Date()) return { text: 'Em Atraso', color: 'bg-red-100 text-red-800' };
    return { text: 'Pendente', color: 'bg-yellow-100 text-yellow-800' };
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 rounded-lg">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-blue-900">Email Marketing</h3>
            <p className="text-sm text-gray-600">Envie comunicações personalizadas</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Formulário */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">Template de Email:</label>
            <select 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={selectedTemplate}
              onChange={(e) => handleTemplateChange(e.target.value)}
            >
              <option value="">Selecione um template</option>
              {templates.map(template => (
                <option key={template.value} value={template.value}>
                  {template.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">Assunto do Email:</label>
            <input 
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Digite o assunto do email"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">Selecionar Destinatários:</label>
            <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto bg-white">
              {clientes.length > 0 ? clientes.map((cliente, idx) => {
                const status = getClientStatus(cliente);
                const key = `${cliente.id || cliente.email || 'idx'}-${idx}`;
                return (
                  <label key={key} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedClients.includes(cliente.id)}
                      onChange={() => handleClientToggle(cliente.id)}
                      className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm flex-1 font-medium text-slate-800">
                      {cliente.nomeResponsavel} - {cliente.nomeEmpresa}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color} shadow-sm`}>
                      {status.text}
                    </span>
                  </label>
                );
              }) : (
                <p className="text-slate-500 text-center py-6 font-medium">Nenhum cliente cadastrado</p>
              )}
            </div>
            <p className="text-sm text-slate-600 mt-3 font-medium">
              {selectedClients.length} clientes selecionados
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={sendEmails}
              disabled={loading || !selectedTemplate || !subject || selectedClients.length === 0}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send className="w-5 h-5" />
              )}
              {loading ? 'Enviando...' : 'Enviar Emails'}
            </button>
            
            <button
              onClick={() => {
                setSelectedClients([]);
                setSubject('');
                setSelectedTemplate('');
              }}
              className="px-6 py-4 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
            >
              Limpar
            </button>
          </div>
        </div>

        {/* Estatticas e Informações */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-50 to-gray-50 p-6 rounded-xl border border-slate-200/50 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-slate-600" />
              Estatticas
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white/70 rounded-lg p-3 shadow-sm border border-slate-100">
                <span className="text-slate-600 font-medium">Total de clientes:</span>
                <span className="font-bold text-slate-800 ml-2 block text-lg">{clientes.length}</span>
              </div>
              <div className="bg-white/70 rounded-lg p-3 shadow-sm border border-slate-100">
                <span className="text-slate-600 font-medium">Selecionados:</span>
                <span className="font-bold text-purple-600 ml-2 block text-lg">{selectedClients.length}</span>
              </div>
              <div className="bg-white/70 rounded-lg p-3 shadow-sm border border-slate-100">
                <span className="text-slate-600 font-medium">Em atraso:</span>
                <span className="font-bold text-red-600 ml-2 block text-lg">
                  {clientes.filter(c => c.proximoVencimento && new Date(c.proximoVencimento) < new Date()).length}
                </span>
              </div>
              <div className="bg-white/70 rounded-lg p-3 shadow-sm border border-slate-100">
                <span className="text-slate-600 font-medium">Pendentes:</span>
                <span className="font-bold text-yellow-600 ml-2 block text-lg">
                  {clientes.filter(c => c.valorPago < c.valorTotal).length}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200/50 shadow-sm">
            <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              Como usar
            </h4>
            <ul className="text-sm text-blue-700 space-y-2 font-medium">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Escolha um template apropriado</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Personalize o assunto se necessário</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Selecione os clientes desejados</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Clique em "Enviar Emails"</span>
              </li>
            </ul>
          </div>

          {selectedTemplate && (
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-xl border border-emerald-200/50 shadow-sm">
              <h4 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                Template Selecionado
              </h4>
              <p className="text-sm text-emerald-700 font-medium">
                {templates.find(t => t.value === selectedTemplate)?.label}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const FinancialManager = () => {
  const { user, loading } = useAuth();
  const { showMessage } = useUI();
  const [showEmailSettings, setShowEmailSettings] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState('clientes');
  // Estado inicial vazio - será carregado do Supabase
  const [clientes, setClientes] = useState([]);

  const [filtros, setFiltros] = useState({
    status: 'todos',
    busca: ''
  });

  const [modalPagamento, setModalPagamento] = useState(false);
  const [modalDetalhes, setModalDetalhes] = useState(false);
  const [modalConfirmacao, setModalConfirmacao] = useState(false);
  const [modalConfirmacaoTodos, setModalConfirmacaoTodos] = useState(false);
  const [modalDespesa, setModalDespesa] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [toast, setToast] = useState('');
  
  const [pagamentoForm, setPagamentoForm] = useState({
    valor: '',
    data: new Date().toISOString().split('T')[0],
    descricao: ''
  });

  // Estado para Contas a Pagar - INDEPENDENTE DO DASHBOARD
  const [despesas, setDespesas] = useState([]);

  // Funções de formatação
const formatarCNPJ = (valor) => {
  // Remove tudo que não é número
  const numeros = valor.replace(/\D/g, '');
  
  // Aplica a mêscara XX.XXX.XXX/XXXX-XX
  if (numeros.length <= 2) return numeros;
  if (numeros.length <= 5) return numeros.replace(/(\d{2})(\d{0,3})/, '$1.$2');
  if (numeros.length <= 8) return numeros.replace(/(\d{2})(\d{3})(\d{0,3})/, '$1.$2.$3');
  if (numeros.length <= 12) return numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{0,4})/, '$1.$2.$3/$4');
  return numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, '$1.$2.$3/$4-$5');
};

const formatarMoedaInput = (valor) => {
  // Remove tudo que não é número
  const numeros = valor.replace(/\D/g, '');
  
  // Converte para número e divide por 100
  const numero = parseFloat(numeros) / 100;
  
  // Formata como moeda brasileira
  return numero.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};
  const parseMoedaParaNumero = (valor) => {
  // Se já for número, retorna direto
  if (typeof valor === 'number') return valor;
  
  // Se for string vazia ou undefined, retorna 0
  if (!valor) return 0;
  
  // Remove pontos e substitui vírgula por ponto
  return parseFloat(valor.toString().replace(/\./g, '').replace(',', '.')) || 0;
};

  const mapClientFromDb = (row) => {
    const rawContrato = row.contrato_data_url || '';
    const isDataUrl = rawContrato.startsWith('data:');
    return {
      id: row.id,
      legacyId: row.legacy_id || null,
      pipefyCardId: row.pipefy_card_id || null,
      nomeResponsavel: row.nome_responsavel || '',
      nomeEmpresa: row.nome_empresa || '',
      nomeFantasia: row.nome_fantasia || '',
      email: row.email || '',
      telefone: row.telefone || '',
      cnpj: row.cnpj || '',
      codigoContrato: row.codigo_contrato || '',
      contratoNome: row.contrato_nome || '',
      contratoPath: isDataUrl ? '' : rawContrato,
      contratoDataUrl: isDataUrl ? rawContrato : '',
      linkPagamento: row.link_pagamento || '',
      valorTotal: Number(row.valor_total || 0),
      valorPago: Number(row.valor_pago || 0),
      parcelas: row.parcelas ?? 1,
      parcelasPagas: row.parcelas_pagas ?? 0,
      valorParcela: Number(row.valor_parcela || 0),
      dataVenda: row.data_venda || '',
      proximoVencimento: row.proximo_vencimento || '',
      observacoes: row.observacoes || '',
      historicosPagamentos: row.historicos_pagamentos || []
    };
  };

  const mapClientToDb = (client) => {
    const payload = {
      legacy_id: typeof client.id === 'number' ? client.id : (client.legacyId || null),
      pipefy_card_id: client.pipefyCardId || null,
      nome_responsavel: client.nomeResponsavel || '',
      nome_empresa: client.nomeEmpresa || '',
      nome_fantasia: client.nomeFantasia || null,
      email: client.email || null,
      telefone: client.telefone || null,
      cnpj: client.cnpj || null,
      codigo_contrato: client.codigoContrato || null,
      contrato_nome: client.contratoNome || null,
      contrato_data_url: client.contratoPath || null,
      link_pagamento: client.linkPagamento || null,
      valor_total: Number(client.valorTotal || 0),
      valor_pago: Number(client.valorPago || 0),
      parcelas: Number(client.parcelas || 1),
      parcelas_pagas: Number(client.parcelasPagas || 0),
      valor_parcela: Number(client.valorParcela || 0),
      data_venda: client.dataVenda || null,
      proximo_vencimento: client.proximoVencimento || null,
      observacoes: client.observacoes || null,
      historicos_pagamentos: client.historicosPagamentos || []
    };

    // Envia id apenas quando já for UUID válido (updates e registros já persistidos).
    if (typeof client.id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(client.id)) {
      payload.id = client.id;
    }

    return payload;
  };

  const createSignedContratoUrl = async (path) => {
    if (!path) return '';
    const { data, error } = await supabase
      .storage
      .from('contratos')
      .createSignedUrl(path, 60 * 60 * 24 * 7);
    if (error) throw error;
    return data?.signedUrl || '';
  };

  const uploadContrato = async (file, clientId) => {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `clientes/${clientId}/${Date.now()}_${safeName}`;
    const { error: uploadError } = await supabase
      .storage
      .from('contratos')
      .upload(path, file, { upsert: true });
    if (uploadError) throw uploadError;
    const signedUrl = await createSignedContratoUrl(path);
    return { path, signedUrl };
  };

  const deleteContrato = async (path) => {
    if (!path) return;
    await supabase.storage.from('contratos').remove([path]);
  };

  const mapDespesaFromDb = (row) => ({
    id: row.id,
    fornecedor: row.fornecedor || '',
    descricao: row.descricao || '',
    valor: Number(row.valor || 0),
    vencimento: row.vencimento || '',
    pago: !!row.pago
  });

  const mapDespesaToDb = (despesa) => ({
    id: despesa.id || undefined,
    fornecedor: despesa.fornecedor || '',
    descricao: despesa.descricao || null,
    valor: Number(despesa.valor || 0),
    vencimento: despesa.vencimento || null,
    pago: !!despesa.pago
  });

  const handleContratoChange = (file, isEditing) => {
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
    } else {
      setNovoCliente({
        ...novoCliente,
        ...payload
      });
    }
  };

  const [novoCliente, setNovoCliente] = useState({
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
});

  // Carregar dados do Supabase e migrar localStorage (apenas se o banco estiver vazio)
  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const { data: clientesData, error: clientesError } = await supabase
          .from('clientes')
          .select('*')
          .order('created_at', { ascending: true });

        if (clientesError) throw clientesError;

        let clientesRows = clientesData || [];

        if (clientesRows.length === 0) {
          const localRaw = localStorage.getItem('financial-manager-clientes');
          if (localRaw) {
            try {
              const localList = JSON.parse(localRaw) || [];
              const rowsToInsert = localList.map((client) => {
                const isNumericId = typeof client.id === 'number' && Number.isFinite(client.id);
                const pipefyCardId =
                  client.pipefyCardId ||
                  (typeof client.id === 'string' ? client.id : null);

                return {
                  ...mapClientToDb({
                    ...client,
                    id: undefined,
                    legacyId: isNumericId ? client.id : null,
                    pipefyCardId: pipefyCardId || null
                  })
                };
              });

              if (rowsToInsert.length > 0) {
                const { data: inserted, error: insertError } = await supabase
                  .from('clientes')
                  .insert(rowsToInsert)
                  .select('*');

                if (insertError) throw insertError;
                clientesRows = inserted || [];
                localStorage.removeItem('financial-manager-clientes');
              }
            } catch (error) {
              console.error('Erro ao migrar clientes do localStorage:', error);
            }
          }
        }

        if (!cancelled) {
          const mapped = (clientesRows || []).map(mapClientFromDb);
          try {
            const enriched = await Promise.all(mapped.map(async (cliente) => {
              if (cliente.contratoPath) {
                try {
                  const signedUrl = await createSignedContratoUrl(cliente.contratoPath);
                  return { ...cliente, contratoDataUrl: signedUrl };
                } catch {
                  return cliente;
                }
              }
              return cliente;
            }));
            if (!cancelled) setClientes(enriched);
          } catch {
            setClientes(mapped);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar clientes do Supabase:', error);
      }

      try {
        const { data: despesasData, error: despesasError } = await supabase
          .from('despesas')
          .select('*')
          .order('created_at', { ascending: true });

        if (despesasError) throw despesasError;

        let despesasRows = despesasData || [];

        if (despesasRows.length === 0) {
          const localRaw = localStorage.getItem('contas-a-pagar');
          if (localRaw) {
            try {
              const localList = JSON.parse(localRaw) || [];
              const rowsToInsert = localList.map((despesa) => ({
                ...mapDespesaToDb({ ...despesa, id: undefined })
              }));

              if (rowsToInsert.length > 0) {
                const { data: inserted, error: insertError } = await supabase
                  .from('despesas')
                  .insert(rowsToInsert)
                  .select('*');

                if (insertError) throw insertError;
                despesasRows = inserted || [];
                localStorage.removeItem('contas-a-pagar');
              }
            } catch (error) {
              console.error('Erro ao migrar despesas do localStorage:', error);
            }
          }
        }

        if (!cancelled) {
          setDespesas((despesasRows || []).map(mapDespesaFromDb));
        }
      } catch (error) {
        console.error('Erro ao carregar despesas do Supabase:', error);
      }
    };

    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  // Toast discreto (auto-hide)
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  const calcularStatus = (cliente) => {
    if (cliente.valorPago >= cliente.valorTotal) return 'pago';
    if (cliente.proximoVencimento && new Date(cliente.proximoVencimento) < new Date()) return 'em_atraso';
    return 'pendente';
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const calcularDiasAtraso = (dataVencimento) => {
    if (!dataVencimento) return 0;
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    const diferenca = hoje - vencimento;
    return Math.max(0, Math.ceil(diferenca / (1000 * 60 * 60 * 24)));
  };
  const clientesFiltrados = clientes.filter(cliente => {
    const status = calcularStatus(cliente);
    const statusFiltro = filtros.status === 'todos' || status === filtros.status;
    const buscaFiltro = filtros.busca === '' || 
      cliente.nomeResponsavel.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      cliente.nomeEmpresa.toLowerCase().includes(filtros.busca.toLowerCase());
    return statusFiltro && buscaFiltro;
  });

  const totais = {
    totalAReceber: clientes.reduce((acc, cliente) => acc + (cliente.valorTotal - cliente.valorPago), 0),
    totalRecebido: clientes.reduce((acc, cliente) => acc + cliente.valorPago, 0),
    clientesEmAtraso: clientes.filter(cliente => calcularStatus(cliente) === 'em_atraso').length,
    totalClientes: clientes.length
  };

  const adicionarCliente = async () => {
  if (!novoCliente.nomeResponsavel || !novoCliente.nomeEmpresa || !novoCliente.valorTotal) {
    showMessage({
      title: 'Campos obrigatorios',
      message: 'Por favor, preencha os campos obrigatorios.',
      type: 'warning'
    });
    return;
  }

  const valorNumerico = parseMoedaParaNumero(novoCliente.valorTotal); // • ADICIONAR
  const valorParcela = valorNumerico / parseInt(novoCliente.parcelas); // • MUDAR
  const novoId = Math.max(...clientes.map(c => c.id), 0) + 1;
  
  const cliente = {
    ...novoCliente,
    id: novoId,
    valorTotal: valorNumerico, // • MUDAR
    valorPago: 0,
    parcelasPagas: 0,
    valorParcela: valorParcela,
    parcelas: parseInt(novoCliente.parcelas),
    historicosPagamentos: []
  };
  
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
  }
};

  const editarCliente = async () => {
  if (!clienteEditando.nomeResponsavel || !clienteEditando.nomeEmpresa || !clienteEditando.valorTotal) {
    showMessage({
      title: 'Campos obrigatorios',
      message: 'Por favor, preencha os campos obrigatorios.',
      type: 'warning'
    });
    return;
  }

  // Se valorTotal já for número, usa direto. Senão, converte
  const valorNumerico = typeof clienteEditando.valorTotal === 'number' 
    ? clienteEditando.valorTotal 
    : parseMoedaParaNumero(clienteEditando.valorTotal);
    
  const valorParcela = valorNumerico / parseInt(clienteEditando.parcelas);
  
  const atualizado = {
    ...clienteEditando,
    valorTotal: valorNumerico,
    valorParcela: valorParcela,
    parcelas: parseInt(clienteEditando.parcelas)
  };

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
      } catch {}
    }

    setClientes(clientes.map(cliente => (
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
  }
};

  const excluirCliente = async () => {
    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', clienteSelecionado.id);

      if (error) throw error;

      setClientes(clientes.filter(cliente => cliente.id !== clienteSelecionado.id));
      setModalConfirmacao(false);
      setClienteSelecionado(null);
      setToast('Cliente excluído.');
    } catch (error) {
      showMessage({
        title: 'Erro ao excluir cliente',
        message: error.message || 'Não foi possível excluir no Supabase.',
        type: 'error'
      });
    }
  };

  const excluirTodosClientes = async () => {
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
    }
  };

  const registrarPagamento = async () => {
  const valorPago = parseFloat(pagamentoForm.valor);
  if (!valorPago || valorPago <= 0) {
    showMessage({
      title: 'Valor inválido',
      message: 'Por favor, insira um valor válido.',
      type: 'warning'
    });
    return;
  }

  let atualizado = null;
  const updatedClientes = clientes.map(cliente => {
    if (cliente.id === clienteSelecionado.id) {
      const novoValorPago = cliente.valorPago + valorPago;
      const novasParcelasPagas = Math.floor(novoValorPago / cliente.valorParcela);
      const novoHistorico = [...(cliente.historicosPagamentos || []), {
        data: pagamentoForm.data,
        valor: valorPago,
        descricao: pagamentoForm.descricao || `Pagamento - ${formatarData(pagamentoForm.data)}`
      }];

      // CORREÇÃO: Atualizar próximo vencimento
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
    try {
      const payload = mapClientToDb(atualizado);
      const { data, error } = await supabase
        .from('clientes')
        .update(payload)
        .eq('id', atualizado.id)
        .select('*')
        .single();

      if (error) throw error;

      setClientes(updatedClientes.map(cliente => (
        cliente.id === atualizado.id ? mapClientFromDb(data) : cliente
      )));
    } catch (error) {
      showMessage({
        title: 'Erro ao salvar pagamento',
        message: error.message || 'Não foi possível atualizar no Supabase.',
        type: 'error'
      });
      return;
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
};

  const exportarRelatorio = () => {
    if (!clientes || clientes.length === 0) {
      console.error('Exportação cancelada: lista de clientes vazia');
      showMessage({
        title: 'Sem dados',
        message: 'Não há clientes para exportar no momento.',
        type: 'warning'
      });
      return;
    }

    // Preparar dados organizados
    const relatorio = clientes.map(cliente => ({
      'ID': cliente.id,
      'Nome do Responsável': cliente.nomeResponsavel,
      'Nome da Empresa': cliente.nomeEmpresa,
      'Email': cliente.email || 'não informado',
      'Telefone': cliente.telefone || 'não informado',
      'Código do Contrato': cliente.codigoContrato,
      'CNPJ': cliente.cnpj || 'não informado',
      'Valor Total (R$)': cliente.valorTotal.toFixed(2).replace('.', ','),
      'Valor Pago (R$)': cliente.valorPago.toFixed(2).replace('.', ','),
      'Valor Restante (R$)': (cliente.valorTotal - cliente.valorPago).toFixed(2).replace('.', ','),
      'Total de Parcelas': cliente.parcelas,
      'Parcelas Pagas': cliente.parcelasPagas,
      'Valor por Parcela (R$)': cliente.valorParcela.toFixed(2).replace('.', ','),
      'Status': calcularStatus(cliente) === 'pago' ? 'Pago' : 
               calcularStatus(cliente) === 'em_atraso' ? 'Em Atraso' : 'Pendente',
      'Data da Venda': cliente.dataVenda || 'não informado',
      'Próximo Vencimento': cliente.proximoVencimento || 'não informado',
      'Dias em Atraso': calcularStatus(cliente) === 'em_atraso' ? 
                        calcularDiasAtraso(cliente.proximoVencimento) : 0,
      'Observações': cliente.observacoes || 'Nenhuma'
    }));

    if (!relatorio || relatorio.length === 0 || !relatorio[0]) {
      console.error('Exportação cancelada: relatório vazio ou inválido', { relatorio });
      showMessage({
        title: 'Relatório inválido',
        message: 'Não foi possível gerar o relatório. Tente novamente.',
        type: 'error'
      });
      return;
    }

    // Criar CSV bem formatado
    const headers = Object.keys(relatorio[0]).filter((key) => key && key.trim().length > 0);
    if (headers.length === 0) {
      console.error('Exportação cancelada: nenhum cabeçalho detectado no relatório', { relatorio });
      showMessage({
        title: 'Relatório inválido',
        message: 'Nenhum cabeçalho encontrado para exportação.',
        type: 'error'
      });
      return;
    }
    const csvContent = [
      headers.join(';'), // Usar ; para melhor compatibilidade com Excel brasileiro
      ...relatorio.map(row => 
        Object.values(row).map(value => {
          // Tratar valores com aspas e quebras de linha
          const stringValue = String(value).replace(/"/g, '""');
          return `"${stringValue}"`;
        }).join(';')
      )
    ].join('\n');

    // Adicionar BOM para UTF-8 (resolve acentos no Excel)
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { 
      type: 'text/csv;charset=utf-8' 
    });
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    showMessage({
      title: 'Relatório exportado',
      message: 'O arquivo pode ser aberto no Excel ou Google Sheets.',
      type: 'success'
    });
  };

  const exportarClientesPDF = () => {
    const dados = Array.isArray(clientesFiltrados) ? clientesFiltrados : [];
    if (dados.length === 0) {
      showMessage({
        title: 'Sem dados',
        message: 'Não há clientes para exportar em PDF.',
        type: 'warning'
      });
      return;
    }

    const janela = window.open('', '_blank', 'width=1200,height=800');
    if (!janela) {
      showMessage({
        title: 'Pop-up bloqueado',
        message: 'Permita pop-ups para exportar o PDF.',
        type: 'warning'
      });
      return;
    }

    janela.document.write(`
      <html>
        <head>
          <title>Preparando PDF...</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 24px; color: #111827; }
          </style>
        </head>
        <body>
          <p>Gerando relatório, aguarde...</p>
        </body>
      </html>
    `);
    janela.document.close();

    const escapeHtml = (value) =>
      String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    const montarRelatorio = () => {
      const linhas = dados
        .map((cliente) => {
          const statusCalculado = calcularStatus(cliente);
          const status = statusCalculado === 'pago'
            ? 'Pago'
            : statusCalculado === 'em_atraso'
            ? 'Em Atraso'
            : 'Pendente';
          const restante = (cliente.valorTotal || 0) - (cliente.valorPago || 0);

          return `
            <tr>
              <td>${escapeHtml(cliente.nomeResponsavel)}</td>
              <td>${escapeHtml(cliente.nomeEmpresa)}</td>
              <td>${escapeHtml(cliente.email || '-')}</td>
              <td>${escapeHtml(cliente.telefone || '-')}</td>
              <td>${escapeHtml(formatarMoeda(cliente.valorTotal || 0))}</td>
              <td>${escapeHtml(formatarMoeda(restante))}</td>
              <td>${escapeHtml(status)}</td>
            </tr>
          `;
        })
        .join('');

      const data = new Date().toLocaleString('pt-BR');
      janela.document.open();
      janela.document.write(`
        <html>
          <head>
            <title>Relatório de Clientes</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 24px; color: #111827; }
              h1 { margin: 0 0 8px; font-size: 24px; }
              .meta { margin-bottom: 16px; color: #4b5563; font-size: 12px; }
              table { width: 100%; border-collapse: collapse; font-size: 12px; }
              th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
              th { background: #f3f4f6; }
            </style>
          </head>
          <body>
            <h1>Relatório de Clientes</h1>
            <div class="meta">Gerado em: ${escapeHtml(data)} | Total: ${dados.length}</div>
            <table>
              <thead>
                <tr>
                  <th>Responsável</th>
                  <th>Empresa</th>
                  <th>Email</th>
                  <th>Telefone</th>
                  <th>Valor Total</th>
                  <th>Valor Restante</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>${linhas}</tbody>
            </table>
          </body>
        </html>
      `);
      janela.document.close();
      setTimeout(() => {
        janela.focus();
        janela.print();
      }, 80);
    };

    if (typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(() => setTimeout(montarRelatorio, 0));
      return;
    }
    setTimeout(montarRelatorio, 0);
  };

  // NOVA função para exportar direto para Google Sheets
  const exportarGoogleSheets = () => {
    const relatorio = clientes.map(cliente => ({
      'ID': cliente.id,
      'Nome do Responsável': cliente.nomeResponsavel,
      'Nome da Empresa': cliente.nomeEmpresa,
      'Email': cliente.email || 'não informado',
      'Telefone': cliente.telefone || 'não informado',
      'CNPJ': cliente.cnpj || 'não informado',
      'Código do Contrato': cliente.codigoContrato,
      'Valor Total': `R$ ${cliente.valorTotal.toFixed(2).replace('.', ',')}`,
      'Valor Pago': `R$ ${cliente.valorPago.toFixed(2).replace('.', ',')}`,
      'Valor Restante': `R$ ${(cliente.valorTotal - cliente.valorPago).toFixed(2).replace('.', ',')}`,
      'Parcelas': `${cliente.parcelasPagas}/${cliente.parcelas}`,
      'Valor por Parcela': `R$ ${cliente.valorParcela.toFixed(2).replace('.', ',')}`,
      'Status': calcularStatus(cliente) === 'pago' ? 'Pago' : 
               calcularStatus(cliente) === 'em_atraso' ? 'Em Atraso' : 'Pendente',
      'Data da Venda': cliente.dataVenda || 'não informado',
      'Próximo Vencimento': cliente.proximoVencimento || 'não informado',
      'Dias em Atraso': calcularStatus(cliente) === 'em_atraso' ? 
                        calcularDiasAtraso(cliente.proximoVencimento) : 0,
      'Observações': cliente.observacoes || 'Nenhuma'
    }));

    // Criar URL para Google Sheets
    const googleSheetsUrl = `https://docs.google.com/spreadsheets/create?usp=sharing`;
    
    // Copiar dados para área de transferência
    navigator.clipboard.writeText(relatorio.map(row => 
      Object.values(row).join('\t')
    ).join('\n')).then(() => {
      // Abrir Google Sheets em nova aba
      window.open(googleSheetsUrl, '_blank');

      showMessage({
        title: 'Dados copiados',
        message: 'A planilha foi aberta. Clique na célula A1 e cole (Ctrl+V/Cmd+V).',
        type: 'success'
      });
    }).catch(() => {
      // Fallback se clipboard não funcionar
      window.open(googleSheetsUrl, '_blank');

      showMessage({
        title: 'Dados copiados',
        message: 'A planilha foi aberta. Clique na célula A1 e cole (Ctrl+V/Cmd+V).',
        type: 'success'
      });
    });
  };

  const fecharModal = () => {
  setModalAberto(false);
  setClienteEditando(null);
  setNovoCliente({
    nomeResponsavel: '',
    nomeEmpresa: '',
    nomeFantasia: '',
    email: '',
    cnpj: '',
    telefone: '',
    valorTotal: '',
    parcelas: 1,
    dataVenda: '',
    proximoVencimento: '',
    codigoContrato: '',
    contratoNome: '',
    contratoDataUrl: '',
    contratoPath: '',
    contratoArquivo: null,
    contratoRemover: false,
    linkPagamento: '',
    observacoes: ''
  });
};

  const getStatusColor = (status) => {
    switch (status) {
      case 'pago': return 'text-green-600 bg-green-100';
      case 'em_atraso': return 'text-red-600 bg-red-100';
      case 'pendente': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pago': return <CheckCircle className="w-4 h-4" />;
      case 'em_atraso': return <AlertCircle className="w-4 h-4" />;
      case 'pendente': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pago': return 'Pago';
      case 'em_atraso': return 'Em Atraso';
      case 'pendente': return 'Pendente';
      default: return 'Pendente';
    }
  };

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
        <div className="flex gap-2 bg-white rounded-lg p-2 mb-6 shadow-md">
          <button
            onClick={() => setAbaAtiva('dashboard')}
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
          <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-lg text-sm z-50">
            {toast}
          </div>
        )}
        {abaAtiva === 'dashboard' && (
          <DashboardAprimorado clientes={clientes} />
        )}

        {abaAtiva === 'clientes' && (
          <>
            {/* Botões de Ferramentas - Exportar */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Ferramentas</h3>
              <div className="flex gap-4 flex-wrap">
                <button
                  onClick={exportarGoogleSheets}
                  className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.5 2.25h-15v19.5h15V2.25zm-1.5 1.5v3h-12v-3h12zm0 4.5v3h-4.5v-3H18zm-6 0v3h-6v-3h6zm6 4.5v3h-4.5v-3H18zm-6 0v3h-6v-3h6zm6 4.5v3h-12v-3h12z"/>
                  </svg>
                  Google Sheets
                </button>
                <button
                  onClick={exportarRelatorio}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Exportar CSV
                </button>
                <button
                  onClick={exportarClientesPDF}
                  className="flex items-center gap-2 bg-slate-700 text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Exportar PDF
                </button>
                <button
                  onClick={() => setShowEmailSettings(true)}
                  className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                  Config. Emails
                </button>
                <button
                  onClick={() => setModalConfirmacaoTodos(true)}
                  className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                  Excluir Todos
                </button>
              </div>
            </div>

            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total a Receber</p>
                    <p className="text-2xl font-bold text-blue-600">{formatarMoeda(totais.totalAReceber)}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Recebido</p>
                    <p className="text-2xl font-bold text-green-600">{formatarMoeda(totais.totalRecebido)}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Clientes em Atraso</p>
                    <p className="text-2xl font-bold text-red-600">{totais.clientesEmAtraso}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-gray-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total de Clientes</p>
                    <p className="text-2xl font-bold text-gray-700">{totais.totalClientes}</p>
                  </div>
                  <Users className="w-8 h-8 text-gray-700" />
                </div>
              </div>
            </div>

            {/* Email Marketing Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <EmailManager clientes={clientes} />
        </div>

        {/* Filtros e Busca */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-5 h-5 absolute left-4 top-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome ou empresa..."
                  className="w-full px-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  value={filtros.busca}
                  onChange={(e) => setFiltros({...filtros, busca: e.target.value})}
                />
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-slate-500 to-gray-600 rounded-lg shadow-sm">
                  <Filter className="w-5 h-5 text-white" />
                </div>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  value={filtros.status}
                  onChange={(e) => setFiltros({...filtros, status: e.target.value})}
                >
                  <option value="todos">Todos os Status</option>
                  <option value="pendente">Pendente</option>
                  <option value="em_atraso">Em Atraso</option>
                  <option value="pago">Pago</option>
                </select>
              </div>
            </div>
            
            <button
              onClick={() => setModalAberto(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              <Plus className="w-5 h-5" />
              Adicionar Cliente
            </button>
          </div>
        </div>

        {/* Lista de Clientes */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Cliente ({totais.totalClientes})
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Contato</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Código Contrato</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Valores</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Parcelas</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Próximo Venc.</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white/70 divide-y divide-slate-200">
                {clientesFiltrados.map((cliente, idx) => {
                  const status = calcularStatus(cliente);
                  const diasAtraso = calcularDiasAtraso(cliente.proximoVencimento);
                  const key = `${cliente.id || cliente.email || 'idx'}-${idx}`;
                  
                  return (
                      <tr key={key} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-bold text-slate-900">{cliente.nomeResponsavel}</div>
                          <div className="text-sm text-slate-600 font-medium">{cliente.nomeEmpresa}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div>{cliente.email}</div>
                          <div className="text-gray-500">{cliente.telefone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {cliente.codigoContrato}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div>Total: {formatarMoeda(cliente.valorTotal)}</div>
                          <div className="text-green-600">Pago: {formatarMoeda(cliente.valorPago)}</div>
                          <div className="text-red-600">Restante: {formatarMoeda(cliente.valorTotal - cliente.valorPago)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{width: `${Math.min((cliente.parcelasPagas / cliente.parcelas) * 100, 100)}%`}}
                            ></div>
                          </div>
                          <span>{cliente.parcelasPagas}/{cliente.parcelas}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatarMoeda(cliente.valorParcela)} cada
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                          {getStatusIcon(status)}
                          {getStatusText(status)}
                          {status === 'em_atraso' && diasAtraso > 0 && (
                            <span className="ml-1">({diasAtraso}d)</span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {cliente.proximoVencimento ? formatarData(cliente.proximoVencimento) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setClienteSelecionado(cliente);
                              setModalDetalhes(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Ver detalhes"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {status !== 'pago' && (
                            <button
                              onClick={() => {
                                setClienteSelecionado(cliente);
                                setPagamentoForm({
                                  valor: cliente.valorParcela.toString(),
                                  data: new Date().toISOString().split('T')[0],
                                  descricao: `${cliente.parcelasPagas + 1}ª parcela`
                                });
                                setModalPagamento(true);
                              }}
                              className="text-green-600 hover:text-green-900"
                              title="Registrar pagamento"
                            >
                              <DollarSign className="w-4 h-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => {
                              setClienteEditando({...cliente});
                              setModalAberto(true);
                            }}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Editar cliente"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => {
                              setClienteSelecionado(cliente);
                              setModalConfirmacao(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="Excluir cliente"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {clientesFiltrados.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum cliente encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">Comece adicionando um novo cliente.</p>
            </div>
          )}
        </div>
        </>
      )}

      {abaAtiva === 'pipefy' && null}

      {/* Modais */}
      {/* Modal Adicionar/Editar Cliente */}
      {modalAberto && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-6">
                {clienteEditando ? 'Editar Cliente' : 'Adicionar Novo Cliente'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Responsável *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    value={clienteEditando ? clienteEditando.nomeResponsavel : novoCliente.nomeResponsavel}
                    onChange={(e) => {
                      const valor = e.target.value;
                      if (clienteEditando) {
                        setClienteEditando({...clienteEditando, nomeResponsavel: valor});
                      } else {
                        setNovoCliente({...novoCliente, nomeResponsavel: valor});
                      }
                    }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    value={clienteEditando ? clienteEditando.nomeEmpresa : novoCliente.nomeEmpresa}
                    onChange={(e) => {
                      const valor = e.target.value;
                      if (clienteEditando) {
                        setClienteEditando({...clienteEditando, nomeEmpresa: valor});
                      } else {
                        setNovoCliente({...novoCliente, nomeEmpresa: valor});
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Fantasia</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    value={clienteEditando ? (clienteEditando.nomeFantasia || '') : (novoCliente.nomeFantasia || '')}
                    onChange={(e) => {
                      const valor = e.target.value;
                      if (clienteEditando) {
                        setClienteEditando({...clienteEditando, nomeFantasia: valor});
                      } else {
                        setNovoCliente({...novoCliente, nomeFantasia: valor});
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
                  <input
                    type="text"
                    placeholder="00.000.000/0000-00"
                    maxLength="18"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    value={clienteEditando ? (clienteEditando.cnpj || '') : (novoCliente.cnpj || '')}
                    onChange={(e) => {
                      const cnpjFormatado = formatarCNPJ(e.target.value);
                      if (clienteEditando) {
                        setClienteEditando({...clienteEditando, cnpj: cnpjFormatado});
                      } else {
                        setNovoCliente({...novoCliente, cnpj: cnpjFormatado});
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    value={clienteEditando ? clienteEditando.email : novoCliente.email}
                    onChange={(e) => {
                      const valor = e.target.value;
                      if (clienteEditando) {
                        setClienteEditando({...clienteEditando, email: valor});
                      } else {
                        setNovoCliente({...novoCliente, email: valor});
                      }
                    }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    value={clienteEditando ? clienteEditando.telefone : novoCliente.telefone}
                    onChange={(e) => {
                      const valor = e.target.value;
                      if (clienteEditando) {
                        setClienteEditando({...clienteEditando, telefone: valor});
                      } else {
                        setNovoCliente({...novoCliente, telefone: valor});
                      }
                    }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código do Contrato *</label>
                  <input
                    type="text"
                    placeholder="Ex: CS 10.2025"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    value={clienteEditando ? clienteEditando.codigoContrato : novoCliente.codigoContrato}
                    onChange={(e) => {
                      const valor = e.target.value;
                      if (clienteEditando) {
                        setClienteEditando({...clienteEditando, codigoContrato: valor});
                      } else {
                        setNovoCliente({...novoCliente, codigoContrato: valor});
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Anexar Contrato</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    onChange={(e) => handleContratoChange(e.target.files && e.target.files[0] ? e.target.files[0] : null, !!clienteEditando)}
                  />
                  {(clienteEditando ? clienteEditando.contratoNome : novoCliente.contratoNome) && (
                    <div className="mt-2 flex items-center justify-between gap-2 text-xs text-gray-600">
                      <span className="truncate">
                        {(clienteEditando ? clienteEditando.contratoNome : novoCliente.contratoNome)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleContratoChange(null, !!clienteEditando)}
                        className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                      >
                        Remover
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link de Pagamento (Asaas)</label>
                  <input
                    type="url"
                    placeholder="https://www.asaas.com/c/..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    value={clienteEditando ? (clienteEditando.linkPagamento || '') : (novoCliente.linkPagamento || '')}
                    onChange={(e) => {
                      const valor = e.target.value;
                      if (clienteEditando) {
                        setClienteEditando({...clienteEditando, linkPagamento: valor});
                      } else {
                        setNovoCliente({...novoCliente, linkPagamento: valor});
                      }
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">Cole o link de cobrança do Asaas</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor Total *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">R$</span>
                    <input
                      type="text"
                      className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="0,00"
                      value={clienteEditando 
                        ? (clienteEditando.valorTotal ? formatarMoedaInput(clienteEditando.valorTotal.toString().replace(/\D/g, '')) : '')
                        : (novoCliente.valorTotal || '')}
                      onChange={(e) => {
                        const valorFormatado = formatarMoedaInput(e.target.value);
                        if (clienteEditando) {
                          setClienteEditando({...clienteEditando, valorTotal: valorFormatado});
                        } else {
                          setNovoCliente({...novoCliente, valorTotal: valorFormatado});
                        }
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Digite apenas números</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Número de Parcelas *</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    value={clienteEditando ? clienteEditando.parcelas : novoCliente.parcelas}
                    onChange={(e) => {
                      const valor = e.target.value;
                      if (clienteEditando) {
                        setClienteEditando({...clienteEditando, parcelas: valor});
                      } else {
                        setNovoCliente({...novoCliente, parcelas: valor});
                      }
                    }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data da Venda *</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    value={clienteEditando ? clienteEditando.dataVenda : novoCliente.dataVenda}
                    onChange={(e) => {
                      const valor = e.target.value;
                      if (clienteEditando) {
                        setClienteEditando({...clienteEditando, dataVenda: valor});
                      } else {
                        setNovoCliente({...novoCliente, dataVenda: valor});
                      }
                    }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Próximo Vencimento</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    value={clienteEditando ? (clienteEditando.proximoVencimento || '') : novoCliente.proximoVencimento}
                    onChange={(e) => {
                      const valor = e.target.value;
                      if (clienteEditando) {
                        setClienteEditando({...clienteEditando, proximoVencimento: valor});
                      } else {
                        setNovoCliente({...novoCliente, proximoVencimento: valor});
                      }
                    }}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    rows="3"
                    value={clienteEditando ? clienteEditando.observacoes : novoCliente.observacoes}
                    onChange={(e) => {
                      const valor = e.target.value;
                      if (clienteEditando) {
                        setClienteEditando({...clienteEditando, observacoes: valor});
                      } else {
                        setNovoCliente({...novoCliente, observacoes: valor});
                      }
                    }}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={fecharModal}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={clienteEditando ? editarCliente : adicionarCliente}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {clienteEditando ? 'Salvar Alterações' : 'Adicionar Cliente'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Registrar Pagamento */}
        {modalPagamento && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Registrar Pagamento</h2>
              <p className="text-sm text-gray-600 mb-4">
                Cliente: <span className="font-medium">{clienteSelecionado?.nomeEmpresa}</span>
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor do Pagamento *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    value={pagamentoForm.valor}
                    onChange={(e) => setPagamentoForm({...pagamentoForm, valor: e.target.value})}
                    placeholder="0,00"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Valor da parcela: {clienteSelecionado && formatarMoeda(clienteSelecionado.valorParcela)}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data do Pagamento *</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    value={pagamentoForm.data}
                    onChange={(e) => setPagamentoForm({...pagamentoForm, data: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    value={pagamentoForm.descricao}
                    onChange={(e) => setPagamentoForm({...pagamentoForm, descricao: e.target.value})}
                    placeholder="Ex: 3ª parcela"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => {
                    setModalPagamento(false);
                    setClienteSelecionado(null);
                    setPagamentoForm({
                      valor: '',
                      data: new Date().toISOString().split('T')[0],
                      descricao: ''
                    });
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={registrarPagamento}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Registrar Pagamento
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Detalhes do Cliente */}
        {modalDetalhes && clienteSelecionado && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-6">Detalhes do Cliente</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Informações Básicas</h3>
                    <div className="mt-2 space-y-2 text-sm text-gray-900">
                      <p><span className="font-medium">Responsável:</span> {clienteSelecionado.nomeResponsavel}</p>
                      <p><span className="font-medium">Empresa:</span> {clienteSelecionado.nomeEmpresa}</p>
                      {clienteSelecionado.nomeFantasia && (
                        <p><span className="font-medium">Nome Fantasia:</span> {clienteSelecionado.nomeFantasia}</p>
                      )}
                      <p><span className="font-medium">Email:</span> {clienteSelecionado.email}</p>
                      <p><span className="font-medium">Telefone:</span> {clienteSelecionado.telefone}</p>
                      <p><span className="font-medium">Código do Contrato:</span> {clienteSelecionado.codigoContrato}</p>
                      {clienteSelecionado.contratoDataUrl ? (
                        <p>
                          <span className="font-medium">Contrato:</span>{' '}
                          <a
                            href={clienteSelecionado.contratoDataUrl}
                            download={clienteSelecionado.contratoNome || 'contrato'}
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            {clienteSelecionado.contratoNome || 'Baixar contrato'}
                          </a>
                        </p>
                      ) : (
                        <p>
                          <span className="font-medium">Contrato:</span>{' '}
                          <span className="text-gray-500">Nenhum contrato anexado</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Informações Financeiras</h3>
                    <div className="mt-2 space-y-2 text-sm text-gray-900">
                      <p><span className="font-medium">Valor Total:</span> {formatarMoeda(clienteSelecionado.valorTotal)}</p>
                      <p><span className="font-medium">Valor Pago:</span> <span className="text-green-600">{formatarMoeda(clienteSelecionado.valorPago)}</span></p>
                      <p><span className="font-medium">Valor Restante:</span> <span className="text-red-600">{formatarMoeda(clienteSelecionado.valorTotal - clienteSelecionado.valorPago)}</span></p>
                      <p><span className="font-medium">Parcelas:</span> {clienteSelecionado.parcelasPagas}/{clienteSelecionado.parcelas}</p>
                      <p><span className="font-medium">Valor por Parcela:</span> {formatarMoeda(clienteSelecionado.valorParcela)}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {clienteSelecionado.historicosPagamentos && clienteSelecionado.historicosPagamentos.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Histórico de Pagamentos</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left">Data</th>
                          <th className="px-3 py-2 text-left">Valor</th>
                          <th className="px-3 py-2 text-left">Descrição</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {clienteSelecionado.historicosPagamentos.map((pagamento, index) => (
                          <tr key={index}>
                            <td className="px-3 py-2">{formatarData(pagamento.data)}</td>
                            <td className="px-3 py-2 text-green-600 font-medium">{formatarMoeda(pagamento.valor)}</td>
                            <td className="px-3 py-2">{pagamento.descricao}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {clienteSelecionado.observacoes && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700">Observações</h3>
                  <p className="mt-1 text-sm text-gray-600">{clienteSelecionado.observacoes}</p>
                </div>
              )}
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    setModalDetalhes(false);
                    setClienteSelecionado(null);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

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
        {modalConfirmacao && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Confirmar Exclusão</h2>
                  <p className="text-sm text-gray-600">
                    Tem certeza que deseja excluir o cliente <span className="font-medium">{clienteSelecionado?.nomeEmpresa}</span>? 
                    Esta ação não pode ser desfeita.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => {
                    setModalConfirmacao(false);
                    setClienteSelecionado(null);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={excluirCliente}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Excluir Cliente
                </button>
              </div>
            </div>
          </div>
        )}

        {modalConfirmacaoTodos && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Confirmar Exclusão</h2>
                  <p className="text-sm text-gray-600">
                    Tem certeza que deseja excluir todos os clientes? Esta ação não pode ser desfeita.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setModalConfirmacaoTodos(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setModalConfirmacaoTodos(false);
                    excluirTodosClientes();
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Excluir Todos
                </button>
              </div>
            </div>
          </div>
        )}
        
        {abaAtiva === 'despesas' && (
          <>
            {/* Cards de Resumo - Despesas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total a Pagar</p>
                    <p className="text-2xl font-bold text-red-600">{formatarMoeda(despesas.reduce((acc, d) => !d.pago ? acc + (d.valor || 0) : acc, 0))}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Pago</p>
                    <p className="text-2xl font-bold text-green-600">{formatarMoeda(despesas.reduce((acc, d) => d.pago ? acc + (d.valor || 0) : acc, 0))}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-orange-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Vencidas</p>
                    <p className="text-2xl font-bold text-orange-600">{despesas.filter(d => !d.pago && new Date(d.vencimento) < new Date()).length}</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </div>

            {/* Tabela de Despesas */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="font-bold text-slate-800">Gerenciar Despesas</h3>
                </div>
                <button
                  onClick={() => setModalDespesa(true)}
                  className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors shadow-md"
                >
                  <Plus className="w-5 h-5" />
                  Adicionar Despesa
                </button>
              </div>

              {despesas.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 border-b-2 border-gray-300">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Fornecedor</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Descrição</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Valor</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Vencimento</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {despesas.map((despesa, idx) => {
                        const vencido = !despesa.pago && new Date(despesa.vencimento) < new Date();
                        return (
                          <tr key={idx} className={vencido ? 'bg-red-50' : 'hover:bg-gray-50'}>
                            <td className="px-4 py-3 font-medium text-gray-900">{despesa.fornecedor}</td>
                            <td className="px-4 py-3 text-gray-600">{despesa.descricao}</td>
                            <td className="px-4 py-3 font-semibold text-gray-900">{formatarMoeda(despesa.valor)}</td>
                            <td className="px-4 py-3 text-gray-600">{formatarData(despesa.vencimento)}</td>
                            <td className="px-4 py-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                despesa.pago 
                                  ? 'bg-green-100 text-green-800' 
                                  : vencido
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {despesa.pago ? 'Pago' : vencido ? 'Vencido' : 'Pendente'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Nenhuma despesa cadastrada</p>
              )}
            </div>
          </>
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

















