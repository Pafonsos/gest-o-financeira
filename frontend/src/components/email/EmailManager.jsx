import React, { useState } from 'react';
import { Mail, Send, Info, BarChart3, CheckCircle } from 'lucide-react';
import emailService from '../../services/emailService';
import { useUI } from '../../contexts/UiContext';

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

        return {
          email: cliente.email || 'cliente@exemplo.com',
          nomeResponsavel: cliente.nomeResponsavel,
          nomeEmpresa: cliente.nomeEmpresa,
          cnpj: cliente.cnpj || 'não informado',
          valorPendente: `R$ ${(cliente.valorTotal - cliente.valorPago).toFixed(2).replace('.', ',')}`,
          parcelasAtraso: parcelasAtraso > 1 ? `${parcelasAtraso} parcelas` : '1 parcela',
          proximoVencimento: cliente.proximoVencimento || 'não informado',
          linkPagamento: cliente.linkPagamento || '#'
        };
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

export default EmailManager;
