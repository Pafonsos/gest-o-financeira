import axios from 'axios';
import { config } from '../lib/config';

const API_BASE_URL = config.apiUrl;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

const emailService = {
  sendBulkEmails: async (emailData) => {
    try {
      // Validação
      if (!emailData.recipients || emailData.recipients.length === 0) {
        throw new Error('Nenhum destinatário fornecido');
      }

      if (!emailData.subject || !emailData.template) {
        throw new Error('Assunto e template são obrigatórios');
      }

      // Limpar dados desnecessários
      const cleanRecipients = emailData.recipients.map(r => ({
        email: r.email,
        nomeResponsavel: r.nomeResponsavel || 'Cliente',
        nomeEmpresa: r.nomeEmpresa || 'Empresa',
        cnpj: r.cnpj || '',
        valorPendente: r.valorPendente || '0,00',
        parcelasAtraso: r.parcelasAtraso || '0',
        proximoVencimento: r.proximoVencimento || '',
        linkPagamento: r.linkPagamento || '#'
      }));

      const payload = {
        recipients: cleanRecipients,
        subject: emailData.subject,
        template: emailData.template
      };

      const payloadString = JSON.stringify(payload);
      const payloadSize = payloadString.length;

      // ANÁLISE DE TAMANHO
      if (payloadSize > 50000) {
        throw new Error(`Payload muito grande: ${(payloadSize / 1024).toFixed(2)} KB. Reduza os dados enviados.`);
      }

      // Enviar request
      const response = await axiosInstance.post('/email/send-bulk', payload);

      return response.data;

    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const serverMessage = error.response.data?.message || error.response.data?.error || '';

        if (status === 431) {
          throw new Error(`Erro 431 do servidor: ${serverMessage || 'Headers muito grandes'}`);
        }
        
        if (status === 429) {
          throw new Error(`Erro 429: ${serverMessage || 'Limite excedido'}`);
        }
        
        if (status === 413) {
          throw new Error(`Erro 413: ${serverMessage || 'Payload muito grande'}`);
        }

        if (status === 400) {
          throw new Error(`Erro 400: ${serverMessage || 'Dados inválidos'}`);
        }
        
        throw new Error(`Erro ${status}: ${serverMessage || error.message}`);
      } else if (error.request) {
        throw new Error(`Servidor não respondeu. Verifique se o backend está rodando em ${API_BASE_URL}`);
      } else {
        throw new Error(error.message);
      }
    }
  },

  sendSingleEmail: async (emailData) => {
    try {
      const response = await axiosInstance.post('/email/send', emailData);
      return response.data;
    } catch (error) {
      console.error('Erro ao enviar email único:', error);
      throw error;
    }
  },

  getTemplates: async () => {
    try {
      const response = await axiosInstance.get('/email/templates');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter templates:', error);
      throw error;
    }
  },

  getStatistics: async () => {
    try {
      const response = await axiosInstance.get('/email/statistics');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      throw error;
    }
  }
};

export default emailService;
















