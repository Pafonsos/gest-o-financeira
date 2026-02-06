import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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

      // DEBUG DETALHADO
      const payloadString = JSON.stringify(payload);
      const payloadSize = payloadString.length;
      
      console.log('\nðŸ” =============== DEBUG COMPLETO ===============');
      console.log('ðŸ“¦ Tamanho do payload:', payloadSize, 'bytes');
      console.log('ðŸ“¦ Tamanho em KB:', (payloadSize / 1024).toFixed(2), 'KB');
      console.log('ðŸ“§ Número de recipients:', cleanRecipients.length);
      console.log('ðŸ“ Template:', payload.template);
      console.log('ðŸ“¬ Subject:', payload.subject);
      
      // Mostrar cada recipient
      cleanRecipients.forEach((r, i) => {
        const rSize = JSON.stringify(r).length;
        console.log(`\nðŸ‘¤ Recipient ${i + 1}:`);
        console.log('   Email:', r.email);
        console.log('   Nome:', r.nomeResponsavel);
        console.log('   Empresa:', r.nomeEmpresa);
        console.log('   CNPJ:', r.cnpj);
        console.log('   Valor:', r.valorPendente);
        console.log('   Parcelas:', r.parcelasAtraso);
        console.log('   Tamanho deste recipient:', rSize, 'bytes');
      });
      
      console.log('\nðŸ“„ Payload completo (primeiros 500 chars):');
      console.log(payloadString.substring(0, 500) + '...');
      console.log('ðŸ” ============================================\n');

      // ANÁLISE DE TAMANHO
      if (payloadSize > 50000) {
        console.error('ðŸš¨ PAYLOAD MUITO GRANDE!', payloadSize, 'bytes');
        console.error('ðŸ’¡ Recomendado: < 50KB');
        throw new Error(`Payload muito grande: ${(payloadSize/1024).toFixed(2)} KB. Reduza os dados enviados.`);
      }

      // Enviar request
      console.log('ðŸ“¤ Enviando para:', API_BASE_URL + '/email/send-bulk');
      const response = await axiosInstance.post('/email/send-bulk', payload);
      
      console.log('âœ… Resposta do servidor:', response.status);
      console.log('âœ… Dados:', response.data);
      
      return response.data;

    } catch (error) {
      console.error('\nâŒ =============== ERRO DETALHADO ===============');
      console.error('Mensagem:', error.message);
      console.error('Status:', error.response?.status);
      console.error('Dados do erro:', error.response?.data);
      console.error('Headers:', error.response?.headers);
      console.error('Config:', {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        timeout: error.config?.timeout
      });
      console.error('âŒ ==============================================\n');
      
      if (error.response) {
        const status = error.response.status;
        const serverMessage = error.response.data?.message || error.response.data?.error || '';
        
        // Mostrar mensagem real do servidor
        console.error('ðŸ”´ Servidor disse:', serverMessage);
        
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
        throw new Error('Servidor não respondeu. Verifique se o backend está rodando em http://localhost:5000');
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
