import React, { useState, useEffect } from 'react';
import { Plus, Search, DollarSign, Users, AlertCircle, CheckCircle, Clock, Filter, Edit, Trash2, Eye, Download, Mail, Send } from 'lucide-react';
import emailService from './services/emailService';

const EmailManager = ({ clientes }) => {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [subject, setSubject] = useState('');
  const [selectedClients, setSelectedClients] = useState([]);
  const [loading, setLoading] = useState(false);

  const templates = [
    { value: 'cobranca', label: 'Cobrança (Clientes em Atraso)', subject: 'Lembrete Importante - Pagamento em Atraso' },
    { value: 'lembrete', label: 'Lembrete (Vencimento Próximo)', subject: 'Lembrete Amigável - Vencimento Próximo' },
    { value: 'promocao', label: 'Promoção (Ofertas Especiais)', subject: 'Oferta Especial - Desconto Exclusivo!' },
    { value: 'confirmacao', label: 'Confirmação (Pagamento Recebido)', subject: 'Pagamento Confirmado - Obrigado!' }
  ];

  const sendEmails = async () => {
    if (!selectedTemplate || !subject || selectedClients.length === 0) {
      alert('Por favor, preencha todos os campos e selecione pelo menos um cliente.');
      return;
    }

    setLoading(true);
    try {
      const recipients = selectedClients.map(id => {
        const cliente = clientes.find(c => c.id === id);
        return {
          email: cliente.email || 'cliente@exemplo.com',
          nomeResponsavel: cliente.nomeResponsavel,
          nomeEmpresa: cliente.nomeEmpresa,
          valorPendente: `R$ ${(cliente.valorTotal - cliente.valorPago).toFixed(2).replace('.', ',')}`,
          proximoVencimento: cliente.proximoVencimento || 'Não informado'
        };
      });

      const response = await emailService.sendBulkEmails({
        recipients,
        subject,
        template: selectedTemplate
      });

      if (response.success) {
        alert(`Emails enviados com sucesso!\n${response.statistics.successful} enviados\n${response.statistics.failed} falhas\nTaxa de sucesso: ${response.statistics.successRate}`);
        setSelectedClients([]);
        setSubject('');
        setSelectedTemplate('');
      }
    } catch (error) {
      alert('Erro ao enviar emails: ' + (error.response?.data?.message || error.message));
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
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Mail className="w-5 h-5 text-purple-600" />
        Email Marketing
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Template de Email:</label>
            <select 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Assunto do Email:</label>
            <input 
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Digite o assunto do email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Selecionar Destinatários:</label>
            <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
              {clientes.length > 0 ? clientes.map(cliente => {
                const status = getClientStatus(cliente);
                return (
                  <label key={cliente.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedClients.includes(cliente.id)}
                      onChange={() => handleClientToggle(cliente.id)}
                    />
                    <span className="text-sm flex-1">
                      {cliente.nomeResponsavel} - {cliente.nomeEmpresa}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                      {status.text}
                    </span>
                  </label>
                );
              }) : (
                <p className="text-gray-500 text-center py-4">Nenhum cliente cadastrado</p>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {selectedClients.length} clientes selecionados
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={sendEmails}
              disabled={loading || !selectedTemplate || !subject || selectedClients.length === 0}
              className="flex-1 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
              {loading ? 'Enviando...' : 'Enviar Emails'}
            </button>
            
            <button
              onClick={() => {
                setSelectedClients([]);
                setSubject('');
                setSelectedTemplate('');
              }}
              className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Limpar
            </button>
          </div>
        </div>

        {/* Estatísticas e Informações */}
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-3">Estatísticas:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total de clientes:</span>
                <span className="font-bold text-blue-600 ml-2">{clientes.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Selecionados:</span>
                <span className="font-bold text-purple-600 ml-2">{selectedClients.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Em atraso:</span>
                <span className="font-bold text-red-600 ml-2">
                  {clientes.filter(c => c.proximoVencimento && new Date(c.proximoVencimento) < new Date()).length}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Pendentes:</span>
                <span className="font-bold text-yellow-600 ml-2">
                  {clientes.filter(c => c.valorPago < c.valorTotal).length}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Como usar:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Escolha um template apropriado</li>
              <li>• Personalize o assunto se necessário</li>
              <li>• Selecione os clientes desejados</li>
              <li>• Clique em "Enviar Emails"</li>
            </ul>
          </div>

          {selectedTemplate && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Template Selecionado:</h4>
              <p className="text-sm text-green-700">
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
  // Estado inicial vazio - será carregado do localStorage
  const [clientes, setClientes] = useState([]);

  const [filtros, setFiltros] = useState({
    status: 'todos',
    busca: ''
  });

  const [modalAberto, setModalAberto] = useState(false);
  const [modalPagamento, setModalPagamento] = useState(false);
  const [modalDetalhes, setModalDetalhes] = useState(false);
  const [modalConfirmacao, setModalConfirmacao] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  
  const [pagamentoForm, setPagamentoForm] = useState({
    valor: '',
    data: new Date().toISOString().split('T')[0],
    descricao: ''
  });
  
  const [novoCliente, setNovoCliente] = useState({
    nomeResponsavel: '',
    nomeEmpresa: '',
    email: '',
    telefone: '',
    valorTotal: '',
    parcelas: 1,
    dataVenda: '',
    proximoVencimento: '',
    servico: '',
    observacoes: ''
  });

  // NOVO: Carregar dados salvos quando o componente inicia
  useEffect(() => {
    const dadosSalvos = localStorage.getItem('financial-manager-clientes');
    if (dadosSalvos) {
      try {
        const clientesCarregados = JSON.parse(dadosSalvos);
        setClientes(clientesCarregados);
        console.log('Dados carregados do localStorage:', clientesCarregados.length, 'clientes');
      } catch (error) {
        console.error('Erro ao carregar dados salvos:', error);
        // Se der erro, usar dados exemplo
        setClientes([
          {
            id: 1,
            nomeResponsavel: "João Silva",
            nomeEmpresa: "Silva & Associados",
            email: "joao@silva.com.br",
            telefone: "(11) 99999-9999",
            valorTotal: 5000,
            valorPago: 2000,
            parcelas: 5,
            parcelasPagas: 2,
            valorParcela: 1000,
            dataVenda: "2024-08-15",
            proximoVencimento: "2024-09-15",
            servico: "Consultoria Empresarial",
            observacoes: "Cliente pontual até agora",
            historicosPagamentos: [
              { data: "2024-08-15", valor: 1000, descricao: "1ª parcela" },
              { data: "2024-08-30", valor: 1000, descricao: "2ª parcela" }
            ]
          }
        ]);
      }
    } else {
      // Primeira vez usando - criar cliente exemplo
      const clienteExemplo = [
        {
          id: 1,
          nomeResponsavel: "João Silva",
          nomeEmpresa: "Silva & Associados",
          email: "joao@silva.com.br",
          telefone: "(11) 99999-9999",
          valorTotal: 5000,
          valorPago: 2000,
          parcelas: 5,
          parcelasPagas: 2,
          valorParcela: 1000,
          dataVenda: "2024-08-15",
          proximoVencimento: "2024-09-15",
          servico: "Consultoria Empresarial",
          observacoes: "Cliente pontual até agora",
          historicosPagamentos: [
            { data: "2024-08-15", valor: 1000, descricao: "1ª parcela" },
            { data: "2024-08-30", valor: 1000, descricao: "2ª parcela" }
          ]
        }
      ];
      setClientes(clienteExemplo);
      console.log('Primeira vez usando - cliente exemplo criado');
    }
  }, []);

  // NOVO: Salvar dados sempre que a lista de clientes mudar
  useEffect(() => {
    if (clientes.length > 0) {
      localStorage.setItem('financial-manager-clientes', JSON.stringify(clientes));
      console.log('Dados salvos no localStorage:', clientes.length, 'clientes');
    }
  }, [clientes]);

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

  const adicionarCliente = () => {
    if (!novoCliente.nomeResponsavel || !novoCliente.nomeEmpresa || !novoCliente.valorTotal) {
      alert('Por favor, preencha os campos obrigatórios');
      return;
    }

    const valorParcela = parseFloat(novoCliente.valorTotal) / parseInt(novoCliente.parcelas);
    const novoId = Math.max(...clientes.map(c => c.id), 0) + 1;
    
    const cliente = {
      ...novoCliente,
      id: novoId,
      valorTotal: parseFloat(novoCliente.valorTotal),
      valorPago: 0,
      parcelasPagas: 0,
      valorParcela: valorParcela,
      parcelas: parseInt(novoCliente.parcelas),
      historicosPagamentos: []
    };
    
    setClientes([...clientes, cliente]);
    fecharModal();
    alert('Cliente adicionado e salvo com sucesso!');
  };

  const editarCliente = () => {
    if (!clienteEditando.nomeResponsavel || !clienteEditando.nomeEmpresa || !clienteEditando.valorTotal) {
      alert('Por favor, preencha os campos obrigatórios');
      return;
    }

    const valorParcela = parseFloat(clienteEditando.valorTotal) / parseInt(clienteEditando.parcelas);
    
    setClientes(clientes.map(cliente => {
      if (cliente.id === clienteEditando.id) {
        return {
          ...clienteEditando,
          valorTotal: parseFloat(clienteEditando.valorTotal),
          valorParcela: valorParcela,
          parcelas: parseInt(clienteEditando.parcelas)
        };
      }
      return cliente;
    }));
    fecharModal();
    alert('Cliente editado e salvo com sucesso!');
  };

  const excluirCliente = () => {
    setClientes(clientes.filter(cliente => cliente.id !== clienteSelecionado.id));
    setModalConfirmacao(false);
    setClienteSelecionado(null);
    alert('Cliente excluído com sucesso!');
  };

  const registrarPagamento = () => {
    const valorPago = parseFloat(pagamentoForm.valor);
    if (!valorPago || valorPago <= 0) {
      alert('Por favor, insira um valor válido');
      return;
    }

    setClientes(clientes.map(cliente => {
      if (cliente.id === clienteSelecionado.id) {
        const novoValorPago = cliente.valorPago + valorPago;
        const novasParcelasPagas = Math.floor(novoValorPago / cliente.valorParcela);
        const novoHistorico = [...(cliente.historicosPagamentos || []), {
          data: pagamentoForm.data,
          valor: valorPago,
          descricao: pagamentoForm.descricao || `Pagamento - ${formatarData(pagamentoForm.data)}`
        }];

        return {
          ...cliente,
          valorPago: novoValorPago,
          parcelasPagas: novasParcelasPagas,
          historicosPagamentos: novoHistorico
        };
      }
      return cliente;
    }));

    setModalPagamento(false);
    setPagamentoForm({
      valor: '',
      data: new Date().toISOString().split('T')[0],
      descricao: ''
    });
    setClienteSelecionado(null);
    alert('Pagamento registrado e salvo com sucesso!');
  };

  const exportarRelatorio = () => {
    // Preparar dados organizados
    const relatorio = clientes.map(cliente => ({
      'ID': cliente.id,
      'Nome do Responsável': cliente.nomeResponsavel,
      'Nome da Empresa': cliente.nomeEmpresa,
      'Email': cliente.email || 'Não informado',
      'Telefone': cliente.telefone || 'Não informado',
      'Serviço Prestado': cliente.servico,
      'Valor Total (R$)': cliente.valorTotal.toFixed(2).replace('.', ','),
      'Valor Pago (R$)': cliente.valorPago.toFixed(2).replace('.', ','),
      'Valor Restante (R$)': (cliente.valorTotal - cliente.valorPago).toFixed(2).replace('.', ','),
      'Total de Parcelas': cliente.parcelas,
      'Parcelas Pagas': cliente.parcelasPagas,
      'Valor por Parcela (R$)': cliente.valorParcela.toFixed(2).replace('.', ','),
      'Status': calcularStatus(cliente) === 'pago' ? 'Pago' : 
               calcularStatus(cliente) === 'em_atraso' ? 'Em Atraso' : 'Pendente',
      'Data da Venda': cliente.dataVenda || 'Não informado',
      'Próximo Vencimento': cliente.proximoVencimento || 'Não informado',
      'Dias em Atraso': calcularStatus(cliente) === 'em_atraso' ? 
                        calcularDiasAtraso(cliente.proximoVencimento) : 0,
      'Observações': cliente.observacoes || 'Nenhuma'
    }));

    // Criar CSV bem formatado
    const headers = Object.keys(relatorio[0]);
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

    alert('Relatório exportado com sucesso!\nO arquivo pode ser aberto no Excel ou Google Sheets.');
  };

  // NOVA função para exportar direto para Google Sheets
  const exportarGoogleSheets = () => {
    const relatorio = clientes.map(cliente => ({
      'ID': cliente.id,
      'Nome do Responsável': cliente.nomeResponsavel,
      'Nome da Empresa': cliente.nomeEmpresa,
      'Email': cliente.email || 'Não informado',
      'Telefone': cliente.telefone || 'Não informado',
      'Serviço Prestado': cliente.servico,
      'Valor Total': `R$ ${cliente.valorTotal.toFixed(2).replace('.', ',')}`,
      'Valor Pago': `R$ ${cliente.valorPago.toFixed(2).replace('.', ',')}`,
      'Valor Restante': `R$ ${(cliente.valorTotal - cliente.valorPago).toFixed(2).replace('.', ',')}`,
      'Parcelas': `${cliente.parcelasPagas}/${cliente.parcelas}`,
      'Valor por Parcela': `R$ ${cliente.valorParcela.toFixed(2).replace('.', ',')}`,
      'Status': calcularStatus(cliente) === 'pago' ? 'Pago' : 
               calcularStatus(cliente) === 'em_atraso' ? 'Em Atraso' : 'Pendente',
      'Data da Venda': cliente.dataVenda || 'Não informado',
      'Próximo Vencimento': cliente.proximoVencimento || 'Não informado',
      'Dias em Atraso': calcularStatus(cliente) === 'em_atraso' ? 
                        calcularDiasAtraso(cliente.proximoVencimento) : 0,
      'Observações': cliente.observacoes || 'Nenhuma'
    }));

    // Converter para formato de tabela HTML
    const headers = Object.keys(relatorio[0]);
    const htmlTable = `
      <table border="1" style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr style="background-color: #f0f0f0;">
            ${headers.map(header => `<th style="padding: 8px; text-align: left;">${header}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${relatorio.map(row => `
            <tr>
              ${Object.values(row).map(value => `<td style="padding: 8px;">${value}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    // Criar URL para Google Sheets
    const encodedData = encodeURIComponent(htmlTable);
    const googleSheetsUrl = `https://docs.google.com/spreadsheets/create?usp=sharing`;
    
    // Copiar dados para área de transferência
    navigator.clipboard.writeText(relatorio.map(row => 
      Object.values(row).join('\t')
    ).join('\n')).then(() => {
      // Abrir Google Sheets em nova aba
      window.open(googleSheetsUrl, '_blank');
      
      alert(`Dados copiados para área de transferência!

Passos para colar no Google Sheets:
1. Uma nova planilha do Google Sheets foi aberta
2. Clique na célula A1 
3. Pressione Ctrl+V (ou Cmd+V no Mac) para colar
4. Os dados serão organizados automaticamente nas colunas

Dica: Você pode formatar as colunas de valores como moeda depois de colar.`);
    }).catch(() => {
      // Fallback se clipboard não funcionar
      window.open(googleSheetsUrl, '_blank');
      alert('Google Sheets aberto em nova aba.\nCopie e cole os dados manualmente da tabela atual.');
    });
  };

  const fecharModal = () => {
    setModalAberto(false);
    setClienteEditando(null);
    setNovoCliente({
      nomeResponsavel: '',
      nomeEmpresa: '',
      email: '',
      telefone: '',
      valorTotal: '',
      parcelas: 1,
      dataVenda: '',
      proximoVencimento: '',
      servico: '',
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerenciamento Financeiro</h1>
            <p className="text-sm text-gray-600 mt-1">Dados salvos automaticamente no navegador</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportarGoogleSheets}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.5 2.25h-15v19.5h15V2.25zm-1.5 1.5v3h-12v-3h12zm0 4.5v3h-4.5v-3H18zm-6 0v3h-6v-3h6zm6 4.5v3h-4.5v-3H18zm-6 0v3h-6v-3h6zm6 4.5v3h-12v-3h12z"/>
              </svg>
              Google Sheets
            </button>
            <button
              onClick={exportarRelatorio}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              Exportar CSV
            </button>
          </div>
        </div>
        
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total a Receber</p>
                <p className="text-2xl font-bold text-blue-600">{formatarMoeda(totais.totalAReceber)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Recebido</p>
                <p className="text-2xl font-bold text-green-600">{formatarMoeda(totais.totalRecebido)}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Clientes em Atraso</p>
                <p className="text-2xl font-bold text-red-600">{totais.clientesEmAtraso}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-gray-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Clientes</p>
                <p className="text-2xl font-bold text-gray-700">{totais.totalClientes}</p>
              </div>
              <Users className="w-8 h-8 text-gray-700" />
            </div>
          </div>
        </div>

        {/* Email Marketing Section */}
        <EmailManager clientes={clientes} />

        {/* Filtros e Busca */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome ou empresa..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filtros.busca}
                  onChange={(e) => setFiltros({...filtros, busca: e.target.value})}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-600" />
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Próximo Venc.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clientesFiltrados.map((cliente) => {
                  const status = calcularStatus(cliente);
                  const diasAtraso = calcularDiasAtraso(cliente.proximoVencimento);
                  
                  return (
                    <tr key={cliente.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{cliente.nomeResponsavel}</div>
                          <div className="text-sm text-gray-500">{cliente.nomeEmpresa}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div>{cliente.email}</div>
                          <div className="text-gray-500">{cliente.telefone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {cliente.servico}
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

        {/* Modal Adicionar/Editar Cliente */}
        {modalAberto && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-6">
                {clienteEditando ? 'Editar Cliente' : 'Adicionar Novo Cliente'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Responsável *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Serviço Prestado *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={clienteEditando ? clienteEditando.servico : novoCliente.servico}
                    onChange={(e) => {
                      const valor = e.target.value;
                      if (clienteEditando) {
                        setClienteEditando({...clienteEditando, servico: valor});
                      } else {
                        setNovoCliente({...novoCliente, servico: valor});
                      }
                    }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor Total *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={clienteEditando ? clienteEditando.valorTotal : novoCliente.valorTotal}
                    onChange={(e) => {
                      const valor = e.target.value;
                      if (clienteEditando) {
                        setClienteEditando({...clienteEditando, valorTotal: valor});
                      } else {
                        setNovoCliente({...novoCliente, valorTotal: valor});
                      }
                    }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Número de Parcelas *</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={pagamentoForm.data}
                    onChange={(e) => setPagamentoForm({...pagamentoForm, data: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Informações Básicas</h3>
                    <div className="mt-2 space-y-2 text-sm">
                      <p><span className="font-medium">Responsável:</span> {clienteSelecionado.nomeResponsavel}</p>
                      <p><span className="font-medium">Empresa:</span> {clienteSelecionado.nomeEmpresa}</p>
                      <p><span className="font-medium">Email:</span> {clienteSelecionado.email}</p>
                      <p><span className="font-medium">Telefone:</span> {clienteSelecionado.telefone}</p>
                      <p><span className="font-medium">Serviço:</span> {clienteSelecionado.servico}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Informações Financeiras</h3>
                    <div className="mt-2 space-y-2 text-sm">
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

        {/* Modal Confirmar Exclusão */}
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
      </div>
    </div>
  );
};

export default FinancialManager;