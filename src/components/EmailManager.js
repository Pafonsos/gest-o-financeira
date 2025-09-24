import React, { useState, useEffect } from 'react';
import { Mail, Send, Users, Eye } from 'lucide-react';
import emailService from '../services/emailService';

const EmailManager = ({ clientes }) => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [subject, setSubject] = useState('');
  const [selectedClients, setSelectedClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState(null);

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
        return {
          email: cliente.email,
          nomeResponsavel: cliente.nomeResponsavel,
          nomeEmpresa: cliente.nomeEmpresa,
          valorPendente: `R$ ${(cliente.valorTotal - cliente.valorPago).toFixed(2).replace('.', ',')}`,
          proximoVencimento: cliente.proximoVencimento
        };
      });

      const response = await emailService.sendBulkEmails({
        recipients,
        subject,
        template: selectedTemplate
      });

      if (response.success) {
        alert(`Emails enviados! ${response.statistics.successful} sucessos, ${response.statistics.failed} falhas`);
        setSelectedClients([]);
        setSubject('');
        setSelectedTemplate('');
        loadStatistics(); // Atualizar estatísticas
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
              <option value="cobranca">Cobrança (Clientes em Atraso)</option>
              <option value="lembrete">Lembrete (Vencimento Próximo)</option>
              <option value="promocao">Promoção (Ofertas Especiais)</option>
              <option value="confirmacao">Confirmação (Pagamento Recebido)</option>
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