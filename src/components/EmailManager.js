import React, { useState, useEffect } from 'react';
import { Mail, Send, Users, Eye } from 'lucide-react';
import emailService from '../services/emailService';

  const EmailManager = ({ clientes }) => {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [subject, setSubject] = useState('');
  const [selectedClients, setSelectedClients] = useState([]);
  const [loading, setLoading] = useState(false);

  // ← ADICIONAR A FUNÇÃO AQUI DENTRO
  const calcularParcelasEmAtraso = (cliente) => {
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
const formatarValorParaEmail = (valor) => {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};
  const templates = [
    // ... resto do código
  ];
  useEffect(() => {
    loadTemplates();
    loadStatistics();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await emailService.getTemplates();
      if (response.success) {
        setTemplates(response.templates);
      }
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await emailService.getStatistics();
      if (response.success) {
        setStatistics(response.statistics);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const sendEmails = async () => {
  if (!selectedTemplate || !subject || selectedClients.length === 0) {
    alert('Por favor, preencha todos os campos e selecione pelo menos um cliente.');
    return;
  }

  setLoading(true);
  try {
    const recipients = selectedClients.map(id => {
      const cliente = clientes.find(c => c.id === id);
      const parcelasAtraso = calcularParcelasEmAtraso(cliente); // ← ADICIONAR
      
      return {
        email: cliente.email || 'cliente@exemplo.com',
        nomeResponsavel: cliente.nomeResponsavel,
        nomeEmpresa: cliente.nomeEmpresa,
        cnpj: cliente.cnpj || 'Não informado', // ← ADICIONAR
        valorPendente: formatarValorParaEmail(cliente.valorTotal - cliente.valorPago),
        parcelasAtraso: parcelasAtraso > 1 ? `${parcelasAtraso} parcelas` : '1 parcela', // ← ADICIONAR
        proximoVencimento: cliente.proximoVencimento || 'Não informado',
        linkPagamento: cliente.linkPagamento || '#'
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

  const handleClientToggle = (clientId) => {
    if (selectedClients.includes(clientId)) {
      setSelectedClients(selectedClients.filter(id => id !== clientId));
    } else {
      setSelectedClients([...selectedClients, clientId]);
    }
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template de Email:
            </label>
            <select 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
            >
              <option value="">Selecione um template</option>
              <option value="primeira-cobranca">Primeira Cobrança (Notificação Inicial)</option>
              <option value="cobranca-7dias">Cobrança Leve (≥ 7 dias de atraso)</option>
              <option value="cobranca-15dias">Cobrança Moderada (≥ 15 dias de atraso)</option>
              <option value="cobranca-30dias">Cobrança Pesada (≥ 30 dias de atraso)</option>
              <option value="solicitacao-contato">Cliente entrar em contato</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assunto do Email:
            </label>
            <input 
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Digite o assunto do email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecionar Destinatários:
            </label>
            <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
              {clientes.map(cliente => (
                <label key={cliente.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedClients.includes(cliente.id)}
                    onChange={() => handleClientToggle(cliente.id)}
                  />
                  <span className="text-sm flex-1">
                    {cliente.nomeResponsavel} - {cliente.nomeEmpresa}
                  </span>
                </label>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {selectedClients.length} clientes selecionados
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={sendEmails}
              disabled={loading || !selectedTemplate || !subject || selectedClients.length === 0}
              className="flex-1 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
              {loading ? 'Enviando...' : 'Enviar Emails'}
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        <div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-3">Estatísticas de Hoje:</h4>
            {statistics ? (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Emails enviados:</span>
                  <span className="font-bold text-green-600 ml-2">{statistics.emailsSentToday}</span>
                </div>
                <div>
                  <span className="text-gray-600">Limite restante:</span>
                  <span className="font-bold text-blue-600 ml-2">{statistics.remainingToday}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Carregando estatísticas...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailManager;